'use client';

import { useLocale } from '@/lib/locale-context';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { useState } from 'react';
import { ChevronDown, Sparkles, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const faqs = {
  en: [
    { q: 'How do I know my ring size?', a: 'You can visit our store for a professional sizing, or use our printable ring size guide available on the product page. We also offer complimentary resizing on most pieces.' },
    { q: 'What materials do you use?', a: 'We use only the finest natural materials including 18k gold, platinum, and ethically sourced diamonds and gemstones. Every piece comes with a certificate of authenticity.' },
    { q: 'Do you offer custom jewellery?', a: 'Yes, our bespoke service allows you to create a one-of-a-kind piece. Book a consultation with our design team to begin your bespoke journey.' },
    { q: 'How long does a bespoke piece take?', a: 'Bespoke pieces typically take 4-8 weeks from design approval to completion, depending on complexity.' },
    { q: 'Do you ship internationally?', a: 'Yes, we ship worldwide with insured delivery. Shipping times vary by destination. Please see our Shipping Policy page for details.' },
    { q: 'What is your return policy?', a: 'We offer a return window for unworn items in original packaging. Custom and bespoke pieces are non-returnable except in cases of manufacturing defects. Please see our Returns and Refunds Policy page for full details.' },
    { q: 'How should I care for my jewellery?', a: 'Store pieces separately, avoid contact with chemicals, and clean gently with a soft cloth. We recommend professional cleaning annually. See our Jewellery Care Guide for detailed instructions.' },
    { q: 'Do you offer jewellery repair?', a: 'Yes, we offer repair services for all DUGARS pieces and other fine jewellery. Contact us for a consultation.' },
    { q: 'Can I change my order after placing it?', a: 'Orders can be cancelled or modified within 24 hours of placement, provided the item has not yet been dispatched. Contact us immediately via WhatsApp or email.' },
    { q: 'Do you offer gift wrapping?', a: 'Yes, all orders are packaged in our signature luxury boxes. Additional gift wrapping options may be available — contact us for details.' },
  ],
  ar: [
    { q: 'كيف أعرف مقاس خاتمي؟', a: 'يمكنك زيارة متجرنا لتحديد المقاس بشكل احترافي، أو استخدام دليل مقاسات الخواتم القابل للطباعة المتوفر في صفحة المنتج. نقدم أيضاً تعديل المقاس مجاناً لمعظم القطع.' },
    { q: 'ما المواد التي تستخدمونها؟', a: 'نستخدم فقط أجود المواد الطبيعية بما في ذلك الذهب عيار 18، البلاتين، والألماس والأحجار الكريمة المصدر بأخلاقية. كل قطعة تأتي مع شهادة أصالة.' },
    { q: 'هل تقدمون مجوهرات مخصصة؟', a: 'نعم، خدمتنا المخصصة تتيح لك إنشاء قطعة فريدة. احجز استشارة مع فريق التصميم لدينا لبدء رحلتك المخصصة.' },
    { q: 'كم تستغرق القطعة المخصصة؟', a: 'تستغرق القطع المخصصة عادةً 4-8 أسابيع من الموافقة على التصميم إلى الاكتمال، حسب التعقيد.' },
    { q: 'هل تشحنون دولياً؟', a: 'نعم، نشحن عالمياً مع توصيل مؤمّن. تختلف أوقات الشحن حسب الوجهة. يرجى الاطلاع على صفحة سياسة الشحن للتفاصيل.' },
    { q: 'ما هي سياسة الإرجاع لديكم؟', a: 'نقدم فترة إرجاع للقطع غير المستعملة في التغليف الأصلي. القطع المخصصة غير قابلة للإرجاع إلا في حالة عيوب التصنيع. يرجى الاطلاع على صفحة سياسة الإرجاع والاسترداد للتفاصيل الكاملة.' },
    { q: 'كيف أعتني بمجوهراتي؟', a: 'خزن القطع بشكل منفصل، تجنب الاتصال بالمواد الكيميائية، ونظف بلطف بقطعة قماش ناعمة. نوصي بتنظيف احترافي سنوياً. راجع دليل رعاية المجوهرات للتعليمات التفصيلية.' },
    { q: 'هل تقدمون إصلاح المجوهرات؟', a: 'نعم، نقدم خدمات الإصلاح لجميع قطع دوغارس والمجوهرات الفاخرة الأخرى. تواصل معنا للاستشارة.' },
    { q: 'هل يمكنني تغيير طلبي بعد تقديمه؟', a: 'يمكن إلغاء أو تعديل الطلبات خلال 24 ساعة من تقديمها، بشرط عدم إرسال المنتج بعد. تواصل معنا فوراً عبر واتساب أو البريد الإلكتروني.' },
    { q: 'هل تقدمون تغليف هدايا؟', a: 'نعم، جميع الطلبات يتم تغليفها في علب فاخرة بتوقيعنا. قد تكون خيارات تغليف هدايا إضافية متاحة — تواصل معنا للتفاصيل.' },
  ],
};

const contentLabels = {
  en: {
    badge: 'DUGARS EXCLUSIVE SUPPORT',
    subtitle: 'Find answers to common questions about our fine jewellery, custom bespoke services, shipping, and care.',
    helpTitle: 'Have more questions?',
    helpSub: 'Our luxury consultants are always happy to assist you.',
  },
  ar: {
    badge: 'دعم دوغارس الحصري',
    subtitle: 'إليك إجابات الأسئلة الشائعة حول مجوهراتنا الفاخرة، الخدمات المخصصة، الشحن، والعناية.',
    helpTitle: 'هل لديك المزيد من الأسئلة؟',
    helpSub: 'خبراء المجوهرات لدينا يسعدهم دائماً مساعدتك.',
  },
};

export function FAQContent() {
  const { locale, t } = useLocale();
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  
  const currentLocale = (locale === 'ar' ? 'ar' : 'en') as 'en' | 'ar';
  const items = faqs[currentLocale];
  const labels = contentLabels[currentLocale];
  const isRtl = currentLocale === 'ar';

  return (
    <div className="min-h-screen bg-white text-stone-900 pb-24" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="container-luxury mx-auto px-4 pt-24 lg:pt-32">
        {/* Breadcrumbs */}
        <div className="text-sm text-stone-500 mb-8">
          <Breadcrumbs items={[{ label: t('nav.home'), href: '/' }, { label: t('footer.faq') }]} />
        </div>

        <div className="mx-auto max-w-3xl">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-800 text-xs font-semibold tracking-wide mb-4 shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{labels.badge}</span>
            </div>

            {/* Title set back to FAQ with Bodoni Moda font family */}
           <h1 
  className="text-4xl sm:text-5xl font-bold tracking-tight "
  style={{ fontFamily:'font-serif' }}
>
  {t('footer.faq')}
</h1>

            <p className="mt-3 text-stone-600 text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
              {labels.subtitle}
            </p>
          </div>

          {/* FAQ Accordion List */}
          <div className="space-y-4">
            {items.map((item, i) => {
              const isOpen = openIndex === i;
              return (
                <div
                  key={i}
                  className={`transition-all duration-300 rounded-2xl border overflow-hidden shadow-sm ${
                    isOpen
                      ? 'bg-amber-50/40 border-amber-500/40 shadow-amber-500/5 shadow-md'
                      : 'bg-stone-50/60 border-stone-200/80 hover:border-amber-400/50 hover:bg-stone-50'
                  }`}
                >
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : i)}
                    className="flex w-full items-center justify-between gap-4 p-5 sm:p-6 text-start focus:outline-none"
                  >
                    <span className={`text-base font-medium transition-colors ${isOpen ? 'text-amber-900' : 'text-stone-800'}`}>
                      {item.q}
                    </span>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-300 shrink-0 ${
                      isOpen
                        ? 'bg-amber-500 text-white border-amber-500 rotate-180'
                        : 'bg-white border-stone-200 text-stone-500 shadow-sm'
                    }`}>
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                      >
                        <div className="px-5 pb-6 pt-2 sm:px-6 border-t border-amber-100/80 text-stone-600 text-sm sm:text-base leading-relaxed font-light">
                          {item.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          {/* Bottom Help Banner */}
          <div className="mt-12 p-8 rounded-2xl bg-gradient-to-r from-amber-50/60 via-stone-50 to-amber-50/60 border border-amber-200 text-center shadow-sm">
            <HelpCircle className="w-8 h-8 text-amber-600 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-stone-900">{labels.helpTitle}</h3>
            <p className="text-sm text-stone-600 mt-1">{labels.helpSub}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
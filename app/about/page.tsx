'use client';

import { useLocale } from '@/lib/locale-context';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { SectionHeading } from '@/components/section-heading';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Gem, 
  Award, 
  Heart, 
  Shield, 
  Globe, 
  Sparkles, 
  ArrowRight, 
  PencilRuler, 
  CheckCircle2, 
  Flame 
} from 'lucide-react';

export default function AboutPage() {
  const { locale, t } = useLocale();
  const isAr = locale === 'ar';

  return (
    <div className="pt-20 lg:pt-24">
      {/* 1. HERO SECTION */}
     

      {/* BREADCRUMBS */}
      <div className="container-luxury">
        <Breadcrumbs items={[{ label: t('nav.home'), href: '/' }, { label: t('nav.about') }]} />
      </div>

      {/* 2. BRAND STORY SECTION (Image Height Matched with Hero Proportion) */}
      <section className="container-luxury py-16 lg:py-10">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">

          {/* Brand Story Image */}
          <motion.div
            initial={{ opacity: 0, x: isAr ? 30 : -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8 }}
            className="group relative h-[400px] w-full sm:h-[500px] lg:h-[550px]"
          >
            <div className="absolute -inset-3 border border-gold/30 transition-all duration-500 group-hover:-inset-2 group-hover:border-gold/60" />

            <div className="relative h-full w-full overflow-hidden shadow-xl">
              <img
                src="/poster.png"
                alt="DUGARS Jewellery — Timeless Elegance"
                loading="lazy"
                className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
              />
            </div>

            <div
              className={`absolute bottom-5 border border-gold/50 bg-[#061D2B]/85 px-5 py-4 backdrop-blur-sm sm:bottom-8 ${
                isAr ? 'right-5 sm:right-8' : 'left-5 sm:left-8'
              }`}
            >
              <p className="font-serif text-lg tracking-[0.2em] text-[#E8CD91]">
                DUGARS
              </p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.25em] text-[#F8F6F0]">
                Jewellery • Elegance • Legacy
              </p>
            </div>
          </motion.div>

          {/* Brand Story Content */}
          <motion.div
            initial={{ opacity: 0, x: isAr ? -30 : 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            dir={isAr ? "rtl" : "ltr"}
            className="flex flex-col justify-center"
          >
            <div className="h-px w-14 bg-gold" />

            <p className="mt-5 text-xs font-medium uppercase tracking-[0.3em] text-gold">
              {isAr ? "قصتنا" : "OUR STORY"}
            </p>

            <h2 className="mt-4 heading-serif text-3xl leading-tight text-heading sm:text-4xl lg:text-5xl">
              {isAr ? "فن الأناقة الخالدة" : "The Art of Timeless Elegance"}
            </h2>

            <p className="mt-6 text-sm leading-8 text-secondary-text sm:text-base">
              {isAr
                ? "في دوغارس للمجوهرات، نؤمن بأن المجوهرات أكثر من مجرد إكسسوار؛ فهي تعبير عن الشخصية، ورمز للحظات الثمينة، وإرث يُعتز به عبر الأجيال. تعكس تصاميمنا تقديرنا للجمال والأناقة والرقي الخالد."
                : "At DUGARS JEWELLERY, we believe that jewellery is more than an accessory — it is a reflection of individuality, a symbol of cherished moments, and a legacy to be treasured for generations. Every design represents our appreciation for beauty, elegance, and timeless sophistication."}
            </p>

            <p className="mt-4 text-sm leading-8 text-secondary-text sm:text-base">
              {isAr
                ? "نستلهم تصاميمنا من جمال التراث وروح التصميم العصري، لنجمع بين الأساليب المميزة والفخامة التي تدوم. وتتمثل رؤيتنا في مساعدتك على الاحتفاء بأجمل لحظات الحياة من خلال مجوهرات تحمل طابعًا شخصيًا وأناقة لا تُنسى."
                : "Inspired by the beauty of tradition and the spirit of modern design, DUGARS brings together distinctive styles and an enduring sense of luxury. Our vision is to help you celebrate life's most meaningful moments with jewellery that feels personal, graceful, and unforgettable."}
            </p>

            <div className="mt-8">
              <Link
                href="/collections"
                className="group inline-flex items-center justify-center border border-gold bg-gold px-7 py-3.5 text-xs font-medium uppercase tracking-[0.18em] text-[#061D2B] transition-all duration-300 hover:bg-transparent hover:text-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
              >
                <span>{isAr ? "اكتشف مجموعتنا" : "Discover Our Collection"}</span>
                <ArrowRight className={`ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 ${isAr ? "rotate-180 group-hover:-translate-x-1" : ""}`} />
              </Link>
            </div>
          </motion.div>

        </div>
      </section>

      {/* 3. KEY STATS / HIGHLIGHTS SECTION */}
      <section className="border-y border-border/10 bg-secondary/30 py-12">
        <div className="container-luxury">
          <div className="grid grid-cols-2 gap-8 text-center md:grid-cols-4">
            {[
              { number: '30+', label: isAr ? 'سنوات من الخبرة' : 'Years of Heritage' },
              { number: '100%', label: isAr ? 'أحجار كريمة معتمدة' : 'Certified Gemstones' },
              { number: '10k+', label: isAr ? 'عميل سعيد' : 'Cherished Clients' },
              { number: '100%', label: isAr ? 'تصاميم مخصصة' : 'Handcrafted Perfection' },
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="space-y-1"
              >
                <p className="font-serif text-3xl font-bold text-gold sm:text-4xl">{stat.number}</p>
                <p className="text-xs uppercase tracking-widest text-secondary-text">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. CRAFTSMANSHIP PROCESS */}
     {/* 4. CRAFTSMANSHIP PROCESS (Refined for High Clarity) */}
      <section className="container-luxury py-16 lg:py-24 border-b border-border/10">
        <SectionHeading title={isAr ? "رحلة إبتكار المجوهرات" : "The Craftsmanship Process"} />
        
        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              step: "01",
              icon: PencilRuler,
              title: isAr ? "التصميم والابتكار" : "Bespoke Design",
              desc: isAr ? "تحويل الأفكار إلى رسم عالي الدقة." : "Translating inspiration into detailed sketches."
            },
            {
              step: "02",
              icon: Gem,
              title: isAr ? "اختيار الأحجار" : "Gem Selection",
              desc: isAr ? "انتقاء أجود الأحجار الكريمة." : "Hand-selecting ethically sourced fine stones."
            },
            {
              step: "03",
              icon: Flame,
              title: isAr ? "الصياغة اليدوية" : "Master Crafting",
              desc: isAr ? "صياغة فائقة بأيدي حرفيين مهرة." : "Forging gold and setting jewels with master precision."
            },
            {
              step: "04",
              icon: CheckCircle2,
              title: isAr ? "ضمان الجودة" : "Quality Check",
              desc: isAr ? "فحص الجودة لضمان الكمال." : "Rigorous check for lasting durability and elegance."
            }
          ].map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="group relative overflow-hidden border border-border/15 bg-secondary/10 p-6 sm:p-8 text-center transition-all duration-300 hover:border-gold/50 hover:bg-secondary/20"
            >
              {/* Step Badge */}
              <div className="absolute top-3 left-4 text-xs font-serif tracking-widest text-gold/40 font-bold">
                {item.step}
              </div>
              
              <div className="mx-auto mt-2 mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-gold/10 text-gold transition-transform duration-300 group-hover:scale-110">
                <item.icon className="h-6 w-6" />
              </div>

              <h3 className="font-serif text-lg text-heading font-medium">{item.title}</h3>
              <p className="mt-2 text-xs leading-relaxed text-secondary-text/80">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 5. PHILOSOPHY & VALUES (Clean Alternate Look) */}
      <section className="container-luxury py-16 lg:py-24">
        <SectionHeading title={t('about.vision')} />
        
        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Gem, title: t('about.materials'), desc: isAr ? 'نستخدم فقط أجود المواد الطبيعية.' : 'Only the finest natural materials.' },
            { icon: Award, title: t('about.craftsmanship'), desc: isAr ? 'حرفية متقونة في كل تفصيل.' : 'Masterful craftsmanship in every detail.' },
            { icon: Heart, title: t('about.promise'), desc: isAr ? 'رضا العملاء هو أولويتنا.' : 'Client satisfaction is our priority.' },
            { icon: Globe, title: t('about.experience'), desc: isAr ? 'تجربة عالمية فاخرة.' : 'A world-class luxury experience.' },
          ].map((item, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 20 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              viewport={{ once: true }} 
              transition={{ duration: 0.5, delay: i * 0.1 }} 
              className="relative flex flex-col justify-between border-t-2 border-gold/40 bg-secondary/5 p-6 sm:p-8 text-center transition-all duration-300 hover:border-gold hover:bg-secondary/15"
            >
              <div>
                <item.icon className="mx-auto h-7 w-7 text-gold mb-4" />
                <h3 className="font-serif text-base sm:text-lg text-heading">{item.title}</h3>
              </div>
              <p className="mt-4 text-xs leading-relaxed text-secondary-text/80 border-t border-border/10 pt-3">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 6. WHY DUGARS (Distinct Premium Cards) */}
      <section className="container-luxury py-20 lg:py-28 bg-secondary/10 border-t border-border/10">
        <div className="max-w-6xl mx-auto">
          <SectionHeading title={t('section.whyDugars')} />
          
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Gem, title: t('trust.authentic'), desc: isAr ? 'نستخدم فقط أجود الأحجار والمعادن الطبيعية.' : 'We use only the finest natural stones and metals.' },
              { icon: Award, title: t('trust.expertCraft'), desc: isAr ? 'حرفيون مهرون بخبرة تتجاوز العقود.' : 'Master craftsmen with decades of expertise.' },
              { icon: Heart, title: t('trust.personalised'), desc: isAr ? 'خدمة مخصصة لكل عميل وكل مناسبة.' : 'Personalised service for every client and occasion.' },
              { icon: Shield, title: t('trust.secureShopping'), desc: isAr ? 'تجربة تسوق آمنة وموثوقة.' : 'A secure and trusted shopping experience.' },
              { icon: Globe, title: t('trust.worldwide'), desc: isAr ? 'مساعدة عالمية لعملائنا حول العالم.' : 'Worldwide assistance for our global clients.' },
              { icon: Sparkles, title: t('trust.privateConsult'), desc: isAr ? 'استشارة خاصة في متجرنا أو افتراضياً.' : 'Private consultations in-store or virtually.' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className="flex items-start gap-4 border border-border/10 bg-background p-6 transition-all duration-300 hover:border-gold/50 hover:shadow-lg"
              >
                <div className="shrink-0 rounded-sm bg-gold/10 p-3 text-gold">
                  <item.icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-serif text-base text-heading font-medium">{item.title}</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-secondary-text/80">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. PRIVATE CONSULTATION CTA */}
     
    </div>
  );
}
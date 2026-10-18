'use client';

import { useLocale } from '@/lib/locale-context';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { ShieldCheck, Info, Sparkles } from 'lucide-react';

interface LegalSection {
  heading: string;
  body: string;
}

interface LegalPageProps {
  titleKey: string;
  sectionsEn: LegalSection[];
  sectionsAr: LegalSection[];
}

export function LegalPage({ titleKey, sectionsEn, sectionsAr }: LegalPageProps) {
  const { locale, t } = useLocale();
  const currentLocale = (locale === 'ar' ? 'ar' : 'en') as 'en' | 'ar';
  const sections = currentLocale === 'ar' ? sectionsAr : sectionsEn;
  const isRtl = currentLocale === 'ar';

  return (
    <div className="min-h-screen bg-white text-stone-900 pb-24" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="container-luxury mx-auto px-4 pt-24 lg:pt-32">
        {/* Breadcrumbs */}
        <div className="text-sm text-stone-500 mb-1">
          <Breadcrumbs items={[{ label: t('nav.home'), href: '/' }, { label: t(titleKey as any) }]} />
        </div>

        <div className="mx-auto max-w-3xl">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-800 text-xs font-semibold tracking-wide mb-4 shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isRtl ? 'معلومات قانونية' : 'LEGAL INFORMATION'}</span>
            </div>

            {/* Standard Serif Title */}
            <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-stone-900 text-[#102B5C]">
              {t(titleKey as any)}
            </h1>

            <div className="mt-4 mx-auto w-16 h-0.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent" />
          </div>

          {/* Legal Sections List */}
          <div className="space-y-6">
            {sections.map((section, i) => (
              <div
                key={i}
                className="group p-6 sm:p-8 rounded-2xl border border-stone-200/80 bg-stone-50/50 hover:bg-white hover:border-amber-400/50 hover:shadow-md transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  {/* Section Number Badge */}
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-amber-800 font-semibold text-xs border border-amber-500/20">
                    {String(i + 1).padStart(2, '0')}
                  </div>

                  <div className="flex-1">
                    <h2 className="font-serif text-xl font-bold text-stone-900 group-hover:text-amber-900 transition-colors">
                      {section.heading}
                    </h2>
                    <p className="mt-3 text-sm sm:text-base leading-relaxed text-stone-600 font-light whitespace-pre-line">
                      {section.body}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Legal Disclaimer Box */}
          <div className="mt-12 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-amber-50/60 via-stone-50 to-amber-50/60 border border-amber-200/80 text-stone-600 shadow-sm">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs sm:text-sm leading-relaxed text-stone-600">
                {isRtl 
                  ? 'هذه الصفحة لأغراض معلوماتية فقط ويجب مراجعة الصياغة القانونية النهائية من قبل مستشار قانوني مرخص في الولايات القضائية التي يعمل فيها العمل.' 
                  : 'This page is for informational purposes only. Final legal wording should be reviewed by a licensed legal advisor in the jurisdictions where the business operates.'}
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
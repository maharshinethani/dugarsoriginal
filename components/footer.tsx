'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useLocale } from '@/lib/locale-context';
import { useSettings } from '@/lib/settings-context';
import { supabase } from '@/lib/supabase';
import { Instagram, Facebook, Mail } from 'lucide-react';
import { toast } from 'sonner';

export function Footer() {
  const { locale, t } = useLocale();
  const { settings, contactEmails, contactPhones } = useSettings();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const pathname = usePathname();

  if (pathname?.startsWith('/admin')) return null;

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert({ email: email.trim(), locale });
      if (error) {
        if (error.code === '23505') {
          toast.error(t('newsletter.duplicate'));
        } else {
          toast.error(t('common.error'));
        }
      } else {
        toast.success(t('newsletter.success'));
        setEmail('');
      }
    } catch {
      toast.error(t('common.error'));
    } finally {
      setSubmitting(false);
    }
  };

  const exploreLinks = [
    { label: t('nav.jewellery'), href: '/jewellery' },
    { label: t('nav.collections'), href: '/collections' },
    
    { label: t('footer.ourStory'), href: '/about' },
    { label: t('nav.appointment'), href: '/appointment' },
  ];

  const careLinks = [
    { label: t('nav.contact'), href: '/contact' },
    { label: t('footer.faq'), href: '/faq' },
    { label: t('footer.shipping'), href: '/shipping' },
    { label: t('footer.returns'), href: '/returns' },
    { label: t('footer.careGuide'), href: '/care-guide' },
  ];

  const legalLinks = [
    { label: t('footer.privacy'), href: '/privacy' },
    { label: t('footer.terms'), href: '/terms' },
  ];

  return (
    <footer className="water-texture-section bg-[#0A1128] text-slate-100">
      {/* Newsletter Section */}
      <div className="border-b border-white/10">
        <div className="container-luxury py-16 text-center">
          <h2 
            className="text-3xl text-slate-100 sm:text-4xl"
            style={{ fontFamily: "'Bodoni Moda', Georgia, serif" }}
          >
            {t('newsletter.title')}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-slate-300">
            {t('newsletter.subtitle')}
          </p>
          <form
            onSubmit={handleSubscribe}
            className="mx-auto mt-8 flex max-w-md flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:gap-0"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('newsletter.placeholder')}
              required
              className="h-12 flex-1 border border-white/20 bg-slate-900/50 px-4 text-sm text-slate-100 outline-none placeholder:text-slate-400 focus:border-amber-400"
            />
            <button
              type="submit"
              disabled={submitting}
              className="flex h-12 items-center justify-center gap-2 bg-amber-400 px-6 text-xs font-medium uppercase tracking-[0.15em] text-slate-950 transition-colors hover:bg-amber-300 disabled:opacity-50"
            >
              {submitting ? '...' : t('newsletter.subscribe')}
            </button>
          </form>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="container-luxury py-16">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
          {/* Brand Column */}
          <div className="col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="DUGARS Logo"
                width={36}
                height={36}
                className="h-9 w-auto object-contain"
              />
              <h3
                className="text-2xl font-semibold tracking-[0.12em] text-slate-100"
                style={{ fontFamily: "'Bodoni Moda', Georgia, serif" }}
              >
                DUGARS
              </h3>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-slate-300">
              {locale === 'ar'
                ? 'فن المجوهرات الخالدة. مصنوعة بأيدٍ ماهرة للحظات التي تستحق التذكر.'
                : 'The art of timeless jewellery. Crafted by master hands for moments worth remembering.'}
            </p>
            <div className="mt-6 flex gap-4">
              {settings?.instagram && (
                <a
                  href={settings.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="text-slate-300 transition-colors hover:text-amber-400"
                >
                  <Instagram className="h-5 w-5" />
                </a>
              )}
              {settings?.facebook && (
                <a
                  href={settings.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="text-slate-300 transition-colors hover:text-amber-400"
                >
                  <Facebook className="h-5 w-5" />
                </a>
              )}
              {settings?.email && (
                <a
                  href={`mailto:${settings.email}`}
                  aria-label="Email"
                  className="text-slate-300 transition-colors hover:text-amber-400"
                >
                  <Mail className="h-5 w-5" />
                </a>
              )}
            </div>
          </div>

          {/* Explore Column */}
          <div>
            <h4 className="label-luxury font-semibold text-amber-400">
              {locale === 'ar' ? 'استكشف' : 'Explore'}
            </h4>
            <ul className="mt-4 space-y-3">
              {exploreLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-xs text-slate-300 transition-colors hover:text-amber-400"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Care Column */}
          <div>
            <h4 className="label-luxury font-semibold text-amber-400">
              {t('footer.customerCare')}
            </h4>
            <ul className="mt-4 space-y-3">
              {careLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-xs text-slate-300 transition-colors hover:text-amber-400"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Column */}
          <div>
            <h4 className="label-luxury font-semibold text-amber-400">
              {locale === 'ar' ? 'قانوني' : 'Legal'}
            </h4>
            <ul className="mt-4 space-y-3">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-xs text-slate-300 transition-colors hover:text-amber-400"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Column */}
          <div>
            <h4 className="label-luxury font-semibold text-amber-400">
              {t('footer.connect')}
            </h4>
            <ul className="mt-4 space-y-3">
              {contactPhones.length > 0 ? (
                contactPhones.map((p) => (
                  <li key={p.id}>
                    <a
                      href={`tel:${p.phone}`}
                      className="text-xs text-slate-300 transition-colors hover:text-amber-400"
                    >
                      {p.phone}
                      {p.label ? ` (${p.label})` : ''}
                    </a>
                  </li>
                ))
              ) : (
                settings?.phone && (
                  <li className="text-xs text-slate-300">{settings.phone}</li>
                )
              )}
              {contactEmails.length > 0 ? (
                contactEmails.map((e) => (
                  <li key={e.id}>
                    <a
                      href={`mailto:${e.email}`}
                      className="text-xs text-slate-300 transition-colors hover:text-amber-400"
                    >
                      {e.email}
                      {e.label ? ` (${e.label})` : ''}
                    </a>
                  </li>
                ))
              ) : (
                settings?.email && (
                  <li>
                    <a
                      href={`mailto:${settings.email}`}
                      className="text-xs text-slate-300 transition-colors hover:text-amber-400"
                    >
                      {settings.email}
                    </a>
                  </li>
                )
              )}
              {settings?.address_en && (
                <li className="text-xs text-slate-300">
                  {locale === 'ar'
                    ? settings.address_ar || settings.address_en
                    : settings.address_en}
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="container-luxury py-6">
          <div className="flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-start">
            <p className="text-[11px] text-slate-400">
              © {new Date().getFullYear()} DUGARS Jewellery. {t('footer.rights')}
            </p>
            <div className="flex gap-6">
              <Link
                href="/privacy"
                className="text-[11px] text-slate-400 transition-colors hover:text-amber-400"
              >
                {t('footer.privacy')}
              </Link>
              <Link
                href="/terms"
                className="text-[11px] text-slate-400 transition-colors hover:text-amber-400"
              >
                {t('footer.terms')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
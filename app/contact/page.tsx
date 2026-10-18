'use client';

import { useState } from 'react';
import { useLocale } from '@/lib/locale-context';
import { useSettings } from '@/lib/settings-context';
import { getWhatsAppUrl } from '@/lib/whatsapp';
import { supabase } from '@/lib/supabase';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { SectionHeading } from '@/components/section-heading';
import { toast } from 'sonner';
import { MapPin, Phone, Mail, MessageCircle, Clock, Instagram, Facebook } from 'lucide-react';

export default function ContactPage() {
  const { locale, t } = useLocale();
  const { settings, contactEmails, contactPhones, whatsappNumbers, getWhatsappForPurpose } = useSettings();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { error } = await supabase.from('enquiries').insert({
        customer_name: form.name,
        phone: form.phone,
        email: form.email,
        message: form.message,
        source: 'contact_form',
        status: 'new',
      });
      if (error) throw error;
      toast.success(t('form.success'));
      setForm({ name: '', email: '', phone: '', message: '' });
    } catch {
      toast.error(t('common.error'));
    } finally {
      setSubmitting(false);
    }
  };

  const generalWhatsapp = getWhatsappForPurpose('general') || settings?.whatsapp_number;
  const whatsappUrl = getWhatsAppUrl({ type: 'general', locale }, generalWhatsapp);

  return (
    <div className="pt-20 lg:pt-24">
      {/* Hero */}
      <section className="relative h-[300px] overflow-hidden sm:h-[400px]">
        <img src="https://images.pexels.com/photos/33257668/pexels-photo-33257668.jpeg?auto=compress&cs=tinysrgb&w=1920" alt="Contact" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-soft-black/60" />
        <div className="absolute inset-0 flex items-center justify-center px-4 text-center">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.4em] text-gold">{t('nav.contact')}</p>
            <h1 className="mt-4 heading-serif text-4xl text-on-dark sm:text-5xl">{t('contact.title')}</h1>
            <p className="mt-3 text-sm text-on-dark/85">{t('contact.subtitle')}</p>
          </div>
        </div>
      </section>

      <div className="container-luxury"><Breadcrumbs items={[{ label: t('nav.home'), href: '/' }, { label: t('nav.contact') }]} /></div>

      <div className="container-luxury py-16">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          {/* Contact info */}
          <div>
            <SectionHeading title={t('contact.title')} align="left" />

            {/* Address */}
            <div className="mt-8 space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center border border-gold/30">
                  <MapPin className="h-5 w-5 text-gold" />
                </div>
                <div>
                  <p className="label-luxury text-secondary-text/70">{t('contact.address')}</p>
                  <p className="mt-1 text-sm text-heading">{locale === 'ar' ? settings?.address_ar || settings?.address_en : settings?.address_en}</p>
                </div>
              </div>

              {/* Phone numbers */}
              {contactPhones.length > 0 && (
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center border border-gold/30">
                    <Phone className="h-5 w-5 text-gold" />
                  </div>
                  <div className="flex-1">
                    <p className="label-luxury text-secondary-text/70">{t('contact.phone')}</p>
                    <div className="mt-1 space-y-1">
                      {contactPhones.map((p) => (
                        <div key={p.id}>
                          <a href={`tel:${p.phone}`} className="text-sm text-heading transition-colors hover:text-gold">{p.phone}</a>
                          {p.label && <span className="ms-2 text-[10px] text-secondary-text/50">({p.label})</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Email addresses */}
              {contactEmails.length > 0 && (
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center border border-gold/30">
                    <Mail className="h-5 w-5 text-gold" />
                  </div>
                  <div className="flex-1">
                    <p className="label-luxury text-secondary-text/70">{t('contact.email')}</p>
                    <div className="mt-1 space-y-1">
                      {contactEmails.map((e) => (
                        <div key={e.id}>
                          <a href={`mailto:${e.email}`} className="text-sm text-heading transition-colors hover:text-gold">{e.email}</a>
                          {e.label && <span className="ms-2 text-[10px] text-secondary-text/50">({e.label})</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Business hours */}
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center border border-gold/30">
                  <Clock className="h-5 w-5 text-gold" />
                </div>
                <div>
                  <p className="label-luxury text-secondary-text/70">{t('contact.hours')}</p>
                  <p className="mt-1 text-sm text-heading">{locale === 'ar' ? 'السبت – الخميس: 10:00 – 22:00 | الجمعة: 16:00 – 22:00' : 'Sat – Thu: 10:00 – 22:00 | Fri: 16:00 – 22:00'}</p>
                </div>
              </div>
            </div>

            {/* WhatsApp numbers */}
            {whatsappNumbers.length > 0 && (
              <div className="mt-8 space-y-3">
                <p className="label-luxury text-secondary-text/70">{locale === 'ar' ? 'واتساب' : 'WhatsApp'}</p>
                {whatsappNumbers.map((w) => (
                  <a
                    key={w.id}
                    href={getWhatsAppUrl({ type: 'general', locale }, w.number)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-sm text-heading transition-colors hover:text-gold"
                  >
                    <MessageCircle className="h-4 w-4 text-gold" />
                    {w.number}
                    {w.label && <span className="text-[10px] text-secondary-text/50">({w.label})</span>}
                  </a>
                ))}
              </div>
            )}

            {/* WhatsApp CTA + Social */}
            <div className="mt-8 space-y-4">
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn-gold w-full sm:w-auto">
                <MessageCircle className="h-4 w-4" />
                {t('contact.whatsapp')}
              </a>
              <div className="flex gap-4">
                {settings?.instagram && <a href={settings.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="flex h-10 w-10 items-center justify-center border border-border/15 transition-colors hover:border-gold hover:text-gold"><Instagram className="h-4 w-4" /></a>}
                {settings?.facebook && <a href={settings.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="flex h-10 w-10 items-center justify-center border border-border/15 transition-colors hover:border-gold hover:text-gold"><Facebook className="h-4 w-4" /></a>}
              </div>
            </div>
          </div>

          {/* Form */}
          <div>
            <h2 className="heading-serif text-2xl text-heading">{t('contact.send')}</h2>
            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              <div>
                <label className="label-luxury mb-2 block text-secondary-text/80">{t('form.name')} *</label>
                <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border border-border/15 bg-card px-4 py-2.5 text-sm text-heading outline-none transition-colors focus:border-gold" />
              </div>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label className="label-luxury mb-2 block text-secondary-text/80">{t('form.email')} *</label>
                  <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full border border-border/15 bg-card px-4 py-2.5 text-sm text-heading outline-none transition-colors focus:border-gold" />
                </div>
                <div>
                  <label className="label-luxury mb-2 block text-secondary-text/80">{t('form.phone')}</label>
                  <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full border border-border/15 bg-card px-4 py-2.5 text-sm text-heading outline-none transition-colors focus:border-gold" />
                </div>
              </div>
              <div>
                <label className="label-luxury mb-2 block text-secondary-text/80">{t('form.message')} *</label>
                <textarea rows={5} required value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="w-full resize-none border border-border/15 bg-card px-4 py-2.5 text-sm text-heading outline-none transition-colors focus:border-gold" />
              </div>
              <button type="submit" disabled={submitting} className="btn-gold w-full disabled:opacity-50">
                {submitting ? t('form.sending') : t('contact.send')}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useLocale } from '@/lib/locale-context';
import { useSettings } from '@/lib/settings-context';
import { useCurrency } from '@/lib/currency-context';
import { getWhatsAppUrl } from '@/lib/whatsapp';
import { supabase } from '@/lib/supabase';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { SectionHeading } from '@/components/section-heading';
import { toast } from 'sonner';
import { Calendar, Video, MessageCircle, Check } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AppointmentPage() {
  const { locale, t } = useLocale();
  const { whatsappNumber } = useSettings();
  const { selectedCountry, selectedCurrency, countries } = useCurrency();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', phone: '', country: selectedCountry?.name || '', date: '', time: '', appointmentType: 'in_store', collection: '', message: '',
  });

  const appointmentTypes = [
    { key: 'in_store', label: t('appointment.inStore'), icon: Calendar },
    { key: 'virtual', label: t('appointment.virtual'), icon: Video },
    { key: 'whatsapp', label: t('appointment.whatsapp'), icon: MessageCircle },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { error } = await supabase.from('appointments').insert({
        customer_name: form.name,
        phone: form.phone,
        email: form.email,
        country: form.country,
        appointment_date: form.date || null,
        appointment_time: form.time || null,
        appointment_type: form.appointmentType,
        collection_interest: form.collection || null,
        message: form.message || null,
        status: 'pending',
      });
      if (error) throw error;
      setSubmitted(true);
      toast.success(t('appointment.success'));
    } catch {
      toast.error(t('common.error'));
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="container-luxury flex min-h-[70vh] flex-col items-center justify-center pt-24 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gold/20">
          <Check className="h-8 w-8 text-gold" />
        </div>
        <h1 className="mt-6 heading-serif text-3xl text-heading">{t('appointment.success')}</h1>
        <a
          href={getWhatsAppUrl({ type: 'appointment', name: form.name, date: form.date, time: form.time, appointmentType: form.appointmentType, country: form.country, locale }, whatsappNumber)}
          target="_blank" rel="noopener noreferrer"
          className="mt-8 btn-gold"
        >
          <MessageCircle className="h-4 w-4" />
          {t('contact.whatsapp')}
        </a>
      </div>
    );
  }

  return (
    <div className="pt-20 lg:pt-24">
      {/* Hero */}
      <section className="relative h-[300px] overflow-hidden sm:h-[400px]">
        <img src="https://images.pexels.com/photos/33257665/pexels-photo-33257665.jpeg?auto=compress&cs=tinysrgb&w=1920" alt="Appointment" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-soft-black/60" />
        <div className="absolute inset-0 flex items-center justify-center px-4 text-center">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.4em] text-gold">{t('section.appointment')}</p>
            <h1 className="mt-4 heading-serif text-4xl text-on-dark sm:text-5xl">{t('appointment.title')}</h1>
            <p className="mt-3 text-sm text-on-dark/85">{t('appointment.subtitle')}</p>
          </div>
        </div>
      </section>

      <div className="container-luxury"><Breadcrumbs items={[{ label: t('nav.home'), href: '/' }, { label: t('nav.appointment') }]} /></div>

      <div className="container-luxury py-16">
        {/* Type selection */}
        <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {appointmentTypes.map((type) => (
            <button
              key={type.key}
              onClick={() => setForm({ ...form, appointmentType: type.key })}
              className={`flex flex-col items-center gap-3 border p-6 text-center transition-all ${form.appointmentType === type.key ? 'border-gold bg-gold/5' : 'border-border/10 hover:border-gold/30'}`}
            >
              <type.icon className={`h-7 w-7 ${form.appointmentType === type.key ? 'text-gold' : 'text-secondary-text/85'}`} />
              <span className={`text-xs font-medium uppercase tracking-wider ${form.appointmentType === type.key ? 'text-gold' : 'text-heading'}`}>{type.label}</span>
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <FormField label={t('form.name')} required>
              <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="luxury-input" />
            </FormField>
            <FormField label={t('form.email')} required>
              <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="luxury-input" />
            </FormField>
            <FormField label={t('form.phone')}>
              <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="luxury-input" />
            </FormField>
            <FormField label={t('form.country')}>
              <select value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} className="luxury-input">
                <option value="">Select country</option>
                {countries.map((c) => <option key={c.code} value={c.name}>{c.flag_emoji} {c.name}</option>)}
              </select>
            </FormField>
            <FormField label={t('form.date')}>
              <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="luxury-input" />
            </FormField>
            <FormField label={t('form.time')}>
              <input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} className="luxury-input" />
            </FormField>
            <FormField label={t('form.collection')}>
              <input type="text" value={form.collection} onChange={(e) => setForm({ ...form, collection: e.target.value })} className="luxury-input" />
            </FormField>
          </div>
          <FormField label={t('form.message')}>
            <textarea rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="luxury-input resize-none" />
          </FormField>
          <button type="submit" disabled={submitting} className="btn-gold w-full disabled:opacity-50">
            {submitting ? t('form.sending') : t('form.submit')}
          </button>
        </form>
      </div>

      <style jsx>{`
        :global(.luxury-input) {
          width: 100%;
          border: 1px solid hsl(var(--border) / 0.15);
          background: transparent;
          padding: 0.625rem 0.875rem;
          font-size: 0.875rem;
          color: hsl(var(--foreground));
          outline: none;
          transition: border-color 0.2s;
        }
        :global(.luxury-input:focus) {
          border-color: hsl(var(--gold));
        }
        :global(.luxury-input::placeholder) {
          color: hsl(var(--foreground) / 0.3);
        }
      `}</style>
    </div>
  );
}

function FormField({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="label-luxury mb-2 block text-secondary-text/80">
        {label} {required && <span className="text-gold">*</span>}
      </label>
      {children}
    </div>
  );
}

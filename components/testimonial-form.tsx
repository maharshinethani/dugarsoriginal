'use client';

import { useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useLocale } from '@/lib/locale-context';
import { toast } from 'sonner';
import { Star, Send } from 'lucide-react';

const SUBMIT_COOLDOWN_MS = 60_000;

export function TestimonialForm() {
  const { locale, t } = useLocale();
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState(5);
  const [productName, setProductName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const lastSubmitRef = useRef<number>(0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;

    // Honeypot: hidden field should be empty
    const form = e.target as HTMLFormElement;
    const honeypot = (form.elements.namedItem('website') as HTMLInputElement)?.value;
    if (honeypot) return;

    if (!name.trim() || !message.trim()) {
      toast.error(locale === 'ar' ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill in all required fields');
      return;
    }
    if (name.trim().length < 2) {
      toast.error(locale === 'ar' ? 'الاسم قصير جداً' : 'Name is too short');
      return;
    }
    if (message.trim().length < 10) {
      toast.error(locale === 'ar' ? 'الرجاء كتابة رأي أطول (١٠ أحرف على الأقل)' : 'Please write a longer testimonial (at least 10 characters)');
      return;
    }
    if (message.trim().length > 500) {
      toast.error(locale === 'ar' ? 'الرأي طويل جداً (٥٠٠ حرف كحد أقصى)' : 'Testimonial is too long (500 characters max)');
      return;
    }

    // Client-side rate limiting
    const now = Date.now();
    if (now - lastSubmitRef.current < SUBMIT_COOLDOWN_MS) {
      const waitSec = Math.ceil((SUBMIT_COOLDOWN_MS - (now - lastSubmitRef.current)) / 1000);
      toast.error(
        locale === 'ar'
          ? `يرجى الانتظار ${waitSec} ثانية قبل الإرسال مرة أخرى`
          : `Please wait ${waitSec}s before submitting again`
      );
      return;
    }

    setSubmitting(true);
    lastSubmitRef.current = now;

    try {
      const { error } = await supabase.from('testimonials').insert({
        customer_name: name.trim().slice(0, 100),
        testimonial_text: message.trim().slice(0, 500),
        rating,
        product_ref: productName.trim() || null,
        status: 'pending',
      });
      if (error) {
        if (error.code === '23505') {
          toast.error(locale === 'ar' ? 'لقد أرسلت رأياً مماثلاً بالفعل' : 'You have already submitted a similar testimonial');
        } else {
          toast.error(locale === 'ar' ? 'فشل الإرسال. يرجى المحاولة مرة أخرى.' : 'Failed to submit. Please try again.');
        }
      } else {
        toast.success(t('testimonial.success'));
        setName('');
        setMessage('');
        setRating(5);
        setProductName('');
      }
    } catch {
      toast.error(locale === 'ar' ? 'فشل الإرسال. يرجى المحاولة مرة أخرى.' : 'Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass = 'w-full border border-border/15 bg-card px-4 py-2.5 text-sm text-heading outline-none transition-colors focus:border-gold';
  const labelClass = 'mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-secondary-text/70';

  return (
    <form onSubmit={handleSubmit} className="mt-8 max-w-xl" noValidate>
      {/* Honeypot field — hidden from real users */}
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <label htmlFor="hp-website">Website</label>
        <input
          id="hp-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="space-y-5">
        <div>
          <label className={labelClass} htmlFor="t-name">{t('testimonial.name')} *</label>
          <input
            id="t-name"
            className={inputClass}
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={100}
            required
          />
        </div>

        <div>
          <label className={labelClass}>{t('testimonial.rating')}</label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="transition-transform hover:scale-110"
                aria-label={`${star} ${locale === 'ar' ? 'نجوم' : 'stars'}`}
              >
                <Star
                  className={`h-6 w-6 ${star <= rating ? 'fill-gold text-gold' : 'text-border/30'}`}
                />
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className={labelClass} htmlFor="t-product">
            {locale === 'ar' ? 'اسم المنتج (اختياري)' : 'Product Name (optional)'}
          </label>
          <input
            id="t-product"
            className={inputClass}
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            maxLength={200}
            placeholder={locale === 'ar' ? 'مثال: خاتم الماسي' : 'e.g. Signature Diamond Ring'}
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="t-message">{t('testimonial.message')} *</label>
          <textarea
            id="t-message"
            className={inputClass}
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={500}
            required
          />
          <p className="mt-1 text-[10px] text-secondary-text/40">
            {message.length}/500
          </p>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="flex items-center gap-2 bg-gold px-6 py-2.5 text-xs font-medium uppercase tracking-wider text-soft-black transition-all hover:bg-gold/90 disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
          {submitting ? (locale === 'ar' ? 'جاري الإرسال...' : 'Submitting...') : t('testimonial.submit')}
        </button>
      </div>
    </form>
  );
}

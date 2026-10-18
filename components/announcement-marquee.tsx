'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useLocale } from '@/lib/locale-context';
import { useSettings } from '@/lib/settings-context';
import { supabase } from '@/lib/supabase';

interface AnnouncementMessage {
  id: string;
  text_en: string;
  text_ar: string;
  display_order: number;
  is_enabled: boolean;
}

const fallbackMessages: AnnouncementMessage[] = [
  { id: 'fallback-1', text_en: 'Timeless Elegance, Crafted to Last', text_ar: 'أناقة خالدة، صُنعت لتدوم', display_order: 1, is_enabled: true },
  { id: 'fallback-2', text_en: 'Discover the Art of Fine Jewellery', text_ar: 'اكتشفوا فن المجوهرات الراقية', display_order: 2, is_enabled: true },
  { id: 'fallback-3', text_en: 'Your Story, Our Craftsmanship', text_ar: 'قصتكم، وحرفيتنا', display_order: 3, is_enabled: true },
];

export function AnnouncementMarquee() {
  const pathname = usePathname();
  const { locale } = useLocale();
  const { settings } = useSettings();
  const [messages, setMessages] = useState<AnnouncementMessage[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    let active = true;
    async function fetchMessages() {
      const { data } = await supabase
        .from('announcement_messages')
        .select('id, text_en, text_ar, display_order, is_enabled')
        .eq('is_enabled', true)
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: true });
      if (active && data?.length) setMessages(data as AnnouncementMessage[]);
    }
    fetchMessages();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  const visibleMessages = messages.length ? messages : fallbackMessages;
  const content = useMemo(() => visibleMessages.map((message) => locale === 'ar' ? message.text_ar : message.text_en), [locale, visibleMessages]);
  const repeatedContent = [...content, ...content];

  if (!mounted || pathname?.startsWith('/admin') || settings?.announcement_bar_enabled === false || !content.length) return null;

  return (
    <div className="marquee-strip fixed inset-x-0 top-0 z-[60] h-8 overflow-hidden" aria-label="Announcements">
      <div className={`announcement-track flex h-full w-max items-center whitespace-nowrap ${locale === 'ar' ? 'direction-rtl' : ''}`}>
        {repeatedContent.map((message, index) => (
          <span key={`${message}-${index}`} className="marquee-text flex items-center text-[9px] font-medium uppercase tracking-[0.2em] sm:text-[10px]">
            <span className="px-5 sm:px-8">{message}</span>
            <span className="marquee-separator" aria-hidden="true">◇</span>
          </span>
        ))}
      </div>
    </div>
  );
}

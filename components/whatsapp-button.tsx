'use client';

import { MessageCircle, X } from 'lucide-react';
import Image from 'next/image';
import { useSettings } from '@/lib/settings-context';
import { useLocale } from '@/lib/locale-context';
import { getWhatsAppUrl } from '@/lib/whatsapp';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { CurrencySelector } from './currency-selector';

export function WhatsAppButton() {
  const { whatsappNumber } = useSettings();
  const { locale } = useLocale();
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (pathname?.startsWith('/admin')) return null;

  const url = getWhatsAppUrl(
    { type: 'general', locale },
    whatsappNumber
  );

  return (
    <div
      className={`fixed bottom-6 end-4 z-40 flex flex-col items-end gap-3 transition-all duration-500 sm:end-6 ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
      }`}
    >
      <CurrencySelector />

      {/* WhatsApp Chat Popup Box */}
      {isOpen && (
        <div className="w-80 rounded-2xl bg-white shadow-2xl border border-gray-100 overflow-hidden transition-all duration-300 animate-in fade-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="bg-[#075E54] text-white p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center shadow overflow-hidden border-2 border-white">
                  <Image
                    src="/logo.png"
                    alt="Dugars Jewellery Logo"
                    width={40}
                    height={40}
                    className="object-contain"
                  />
                </div>
                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-400 border-2 border-[#075E54]" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-white leading-tight">Dugars Jewellery</h3>
                <p className="text-xs text-emerald-200">Online now</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-emerald-200 hover:text-white transition-colors p-1"
              aria-label="Close chat"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Chat Body */}
          <div className="p-4 bg-[#E5DDD5]/20 flex flex-col space-y-3">
            <div className="bg-white p-3.5 rounded-2xl rounded-tl-sm shadow-sm max-w-[85%] border border-gray-100">
              <p className="text-xs sm:text-sm text-gray-800 leading-relaxed">
                Hi! 👋 Looking for exquisite jewellery? Chat with our team for assistance and collection details.
              </p>
            </div>

            {/* Start Chat Button */}
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 flex items-center justify-center space-x-2 w-full bg-[#25D366] hover:bg-[#20ba5a] text-white font-medium py-2.5 px-4 rounded-xl shadow transition-all text-sm"
            >
              <MessageCircle className="h-4 w-4 fill-white" />
              <span>Start Chat</span>
            </a>
          </div>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle WhatsApp chat"
        className="relative flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl"
      >
        <div className={`absolute transition-transform duration-300 ${isOpen ? 'rotate-90 scale-0' : 'rotate-0 scale-100'}`}>
          <MessageCircle className="h-6 w-6 text-white" />
        </div>
        <div className={`absolute transition-transform duration-300 ${isOpen ? 'rotate-0 scale-100' : '-rotate-90 scale-0'}`}>
          <X className="h-6 w-6 text-white" />
        </div>
        {!isOpen && (
          <span className="absolute inset-0 animate-ping rounded-full bg-[#25D366] opacity-20 pointer-events-none" />
        )}
      </button>
    </div>
  );
}
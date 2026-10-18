import type { Metadata } from 'next';
import { FAQContent } from '@/components/faq-content';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions — DUGARS Jewellery',
  description: 'Answers to common questions about ring sizing, materials, custom jewellery, shipping, returns, care, and repairs at DUGARS Jewellery.',
  alternates: { canonical: '/faq' },
  robots: { index: true, follow: true },
};

export default function FAQPage() {
  return <FAQContent />;
}

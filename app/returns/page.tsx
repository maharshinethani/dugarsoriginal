import type { Metadata } from 'next';
import { LegalPage } from '@/components/legal-page';

export const metadata: Metadata = {
  title: 'Returns and Refunds Policy — DUGARS Jewellery',
  description: 'Eligible items, exclusions, return windows, condition requirements, custom jewellery returns, damaged products, refund timelines, and the return procedure at DUGARS Jewellery.',
  alternates: { canonical: '/returns' },
  robots: { index: true, follow: true },
};

const sectionsEn = [
  { heading: 'Return Window', body: 'We offer a return window of [X days — to be confirmed by the business owner] from the date you receive your order. Items must be returned in their original condition, unworn, and in their original packaging with all tags and certificates included.' },
  { heading: 'Eligible Items', body: 'Ready-to-wear jewellery items in their original, unworn condition with all packaging and certificates are eligible for return. Items must show no signs of wear, alteration, or damage caused by the customer.' },
  { heading: 'Non-Returnable Items', body: 'The following items are non-returnable except in cases of manufacturing defects: custom and bespoke jewellery, engraved or personalised pieces, earrings for hygiene reasons (unless sealed and unopened), and items marked as final sale.' },
  { heading: 'Damaged or Incorrect Products', body: 'If you receive a damaged or incorrect item, please contact us within 48 hours of delivery with photographic evidence. We will arrange a replacement or full refund at no cost to you. Items damaged in transit must be reported before the packaging is discarded.' },
  { heading: 'How to Initiate a Return', body: 'To start a return, contact us via WhatsApp or email with your order number and reason for return. Once your return is approved, you will receive return instructions and a shipping label. Items must be shipped back using the provided instructions.' },
  { heading: 'Refund Timeline', body: 'Refunds are processed within 5-10 business days after we receive and inspect the returned item. Refunds are issued to the original payment method. Processing times may vary depending on your bank or payment provider.' },
  { heading: 'Return Shipping Costs', body: 'Return shipping costs for change-of-mind returns are the responsibility of the customer. For damaged or incorrect items, we cover all return shipping costs. [Return shipping cost policy to be confirmed by the business owner.]' },
  { heading: 'Exchanges', body: 'We offer exchanges for size where applicable. To request an exchange, follow the same return process and indicate the desired replacement size or item. Exchange availability is subject to stock.' },
  { heading: 'Contact Us', body: 'For any questions about returns or refunds, please contact us through our Contact page or via WhatsApp. Have your order number ready for faster assistance.' },
];

const sectionsAr = [
  { heading: 'فترة الإرجاع', body: 'نقدم فترة إرجاع مدتها [X يوم — للتأكيد من قبل صاحب العمل] من تاريخ استلام طلبك. يجب إرجاع العناصر في حالتها الأصلية، غير مستعملة، وفي تغليفها الأصلي مع جميع الشهادات.' },
  { heading: 'العناصر المؤهلة', body: 'عناصر المجوهرات الجاهزة في حالتها الأصلية غير المستعملة مع جميع التغليف والشهادات مؤهلة للإرجاع. يجب ألا تظهر العناصر أي علامات للاستعمال أو التعديل.' },
  { heading: 'العناصر غير القابلة للإرجاع', body: 'العناصر التالية غير قابلة للإرجاع إلا في حالات عيوب التصنيع: المجوهرات المخصصة، القطع المنقوشة أو الشخصية، الأقراط لأسباب صحية (إلا إذا كانت مغلقة وغير مفتوحة)، والعناصر المميزة كتصفية نهائية.' },
  { heading: 'المنتجات التالفة أو غير الصحيحة', body: 'إذا استلمت عنصراً تالفاً أو غير صحيح، يرجى التواصل معنا خلال 48 ساعة من التسليم مع دليل صوري. سنرتب استبدالاً أو استرداداً كاملاً دون أي تكلفة عليك.' },
  { heading: 'كيفية بدء الإرجاع', body: 'لبدء الإرجاع، تواصل معنا عبر واتساب أو البريد الإلكتروني مع رقم طلبك وسبب الإرجاع. بمجرد الموافقة، ستصلك تعليمات الإرجاع وملصق شحن.' },
  { heading: 'وقت الاسترداد', body: 'تتم معالجة الاسترداد خلال 5-10 أيام عمل بعد استلام وفحص العنصر المرتجع. يُصدر الاسترداد إلى طريقة الدفع الأصلية.' },
  { heading: 'تكاليف شحن الإرجاع', body: 'تكاليف شحن الإرجاع لتغيير الرأي هي مسؤولية العميل. للعناصر التالفة أو غير الصحيحة، نغطي جميع تكاليف شحن الإرجاع. [سياسة تكلفة شحن الإرجاع للتأكيد من قبل صاحب العمل.]' },
  { heading: 'الاستبدال', body: 'نقدم استبدالاً للمقاس حيثما ينطبق. لطلب استبدال، اتبع نفس عملية الإرجاع وحدد المقاس أو العنصر البديل المطلوب.' },
  { heading: 'اتصل بنا', body: 'لأي أسئلة حول الإرجاع أو الاسترداد، يرجى التواصل معنا عبر صفحة الاتصال أو واتساب.' },
];

export default function ReturnsPage() {
  return <LegalPage titleKey="footer.returns" sectionsEn={sectionsEn} sectionsAr={sectionsAr} />;
}

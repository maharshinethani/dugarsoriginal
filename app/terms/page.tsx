import type { Metadata } from 'next';
import { LegalPage } from '@/components/legal-page';

export const metadata: Metadata = {
  title: 'Terms and Conditions — DUGARS Jewellery',
  description: 'The terms and conditions governing the use of the DUGARS Jewellery website, including orders, pricing, custom jewellery, and intellectual property.',
  alternates: { canonical: '/terms' },
  robots: { index: true, follow: true },
};

const sectionsEn = [
  { heading: 'Effective Date', body: 'These Terms and Conditions were last updated on 10 October 2026. By accessing or using our website, you agree to be bound by these terms.' },
  { heading: 'Website Use and Eligibility', body: 'You must be at least 18 years old to make a purchase. By using this website, you represent that you are legally capable of entering into binding contracts. You agree to use the website lawfully and not to engage in any activity that could harm, disable, or impair the site.' },
  { heading: 'Product Descriptions and Photography', body: 'We make every effort to display our jewellery accurately, including colours, dimensions, and materials. However, product photographs may appear slightly different from the actual items due to lighting, screen settings, and natural variations in gemstones and metals. Product availability is subject to change without notice.' },
  { heading: 'Prices and Currencies', body: 'All prices are displayed in your selected currency and may vary based on exchange rates. Prices are subject to change without prior notice. We reserve the right to correct pricing errors. Payment is processed at the time of order confirmation.' },
  { heading: 'Orders and Acceptance', body: 'Placing an order constitutes an offer to purchase. We reserve the right to accept or decline any order at our discretion. Order confirmation does not guarantee availability. If we are unable to fulfil your order, we will notify you and process a refund if payment has been made.' },
  { heading: 'Cancellations', body: 'Orders may be cancelled within 24 hours of placement, provided the item has not yet been dispatched. Custom and bespoke orders cannot be cancelled once production has begun. To request a cancellation, contact us immediately via WhatsApp or email.' },
  { heading: 'Payment Terms', body: 'We accept payment methods as displayed at checkout. All payments are processed securely through our payment partners. We do not store your full card details on our servers.' },
  { heading: 'Custom and Bespoke Jewellery', body: 'Custom and bespoke pieces are made to your specifications. A design consultation is required before production begins. A deposit may be required for bespoke orders. Custom pieces are non-returnable except in cases of manufacturing defects. Design approvals are final, and changes after production begins may incur additional costs.' },
  { heading: 'Intellectual Property', body: 'All content on this website, including images, designs, text, logos, and graphics, is the property of DUGARS Jewellery and is protected by intellectual property laws. You may not reproduce, distribute, or use any content without our written permission.' },
  { heading: 'Limitation of Liability', body: 'To the maximum extent permitted by law, DUGARS Jewellery shall not be liable for any indirect, incidental, special, or consequential damages arising from the use of our website or products. Our total liability for any claim shall not exceed the amount you paid for the relevant product.' },
  { heading: 'Applicable Law and Dispute Resolution', body: 'These terms shall be governed by the laws of the jurisdiction in which DUGARS Jewellery is registered. Any disputes shall be resolved through good-faith negotiations first, and if unresolved, through the appropriate legal channels. [Applicable jurisdiction to be confirmed by the business owner.]' },
  { heading: 'Customer Support', body: 'For any questions about these Terms and Conditions, or for customer support, please contact us through our Contact page. [Business contact details to be confirmed by the business owner.]' },
];

const sectionsAr = [
  { heading: 'تاريخ السريان', body: 'تم آخر تحديث لهذه الشروط والأحكام في 10 أكتوبر 2026. بالوصول إلى موقعنا أو استخدامه، فإنك توافق على الالتزام بهذه الشروط.' },
  { heading: 'استخدام الموقع والأهلية', body: 'يجب أن يكون عمرك 18 عاماً على الأقل لإجراء عملية شراء. باستخدامك لهذا الموقع، تقر بأنك قادر قانونياً على إبرام عقود ملزمة.' },
  { heading: 'أوصاف المنتجات والتصوير', body: 'نبذل قصارى جهدنا لعرض مجوهراتنا بدقة. ومع ذلك، قد تظهر صور المنتجات بشكل مختلف قليلاً عن العناصر الفعلية بسبب الإضاءة وإعدادات الشاشة والاختلافات الطبيعية في الأحجار الكريمة والمعادن.' },
  { heading: 'الأسعار والعملات', body: 'تُعرض جميع الأسعار بالعملة المحددة وقد تختلف بناءً على أسعار الصرف. تخضع الأسعار للتغيير دون إشعار مسبق. نحتفظ بالحق في تصحيح أخطاء التسعير.' },
  { heading: 'الطلبات والقبول', body: 'تقديم طلب يشكل عرضاً للشراء. نحتفظ بالحق في قبول أو رفض أي طلب لتقديرنا. تأكيد الطلب لا يضمن التوفر.' },
  { heading: 'الإلغاء', body: 'يمكن إلغاء الطلبات خلال 24 ساعة من تقديمها، بشرط عدم إرسال المنتج بعد. لا يمكن إلغاء الطلبات المخصصة بمجرد بدء الإنتاج.' },
  { heading: 'شروط الدفع', body: 'نقبل طرق الدفع المعروضة عند الدفع. تتم معالجة جميع المدفوعات بأمان من خلال شركاء الدفع لدينا. لا نخزن تفاصيل بطاقتك الكاملة على خوادمنا.' },
  { heading: 'المجوهرات المخصصة', body: 'القطع المخصصة مصنوعة according لمواصفاتك. يلزم استشارة تصميم قبل بدء الإنتاج. قد يُطلب دفعة مقدمة للطلبات المخصصة. القطع المخصصة غير قابلة للإرجاع إلا في حالة عيوب التصنيع.' },
  { heading: 'الملكية الفكرية', body: 'جميع المحتويات على هذا الموقع، بما في ذلك الصور والتصاميم والنصوص والشعارات والرسومات، هي ملكية لدوغارس للمجوهرات ومحمية بقوانين الملكية الفكرية.' },
  { heading: 'حدود المسؤولية', body: 'بالحد الأقصى الذي يسمح به القانون، لن تكون دوغارس مسؤولة عن أي أضرار غير مباشرة أو عرضية أو خاصة أو تبعية تنشأ عن استخدام موقعنا أو منتجاتنا.' },
  { heading: 'القانون المعمول به وحل النزاعات', body: 'تخضع هذه الشروط لقوانين الولاية القضائية التي سُجلت فيها دوغارس. تُحل أي نزاعات من خلال مفاوضات حسنة النية أولاً. [الولاية القضائية المعمول بها لتأكيدها من قبل صاحب العمل.]' },
  { heading: 'دعم العملاء', body: 'لأي أسئلة حول هذه الشروط والأحكام، أو لدعم العملاء، يرجى التواصل معنا عبر صفحة الاتصال. [تفاصيل اتصال الأعمال لتأكيدها.]' },
];

export default function TermsPage() {
  return <LegalPage titleKey="footer.terms" sectionsEn={sectionsEn} sectionsAr={sectionsAr} />;
}

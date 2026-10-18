import type { Metadata } from 'next';
import { LegalPage } from '@/components/legal-page';

export const metadata: Metadata = {
  title: 'Shipping Policy — DUGARS Jewellery',
  description: 'Processing times, shipping methods, supported destinations, delivery estimates, tracking, customs duties, and shipping enquiries for DUGARS Jewellery.',
  alternates: { canonical: '/shipping' },
  robots: { index: true, follow: true },
};

const sectionsEn = [
  { heading: 'Processing Time', body: 'Orders are processed within 1-3 business days of payment confirmation. Custom and bespoke pieces require additional production time, which will be communicated at the time of order. You will receive a confirmation email once your order has been dispatched.' },
  { heading: 'Shipping Methods', body: 'We offer insured shipping through reputable international couriers. All shipments require a signature upon delivery. Shipping methods and estimated delivery times will be displayed at checkout based on your destination.' },
  { heading: 'Supported Destinations', body: 'We currently ship to most international destinations. If your country is not listed at checkout, please contact us and we will endeavour to arrange delivery. [Full list of supported destinations to be confirmed by the business owner.]' },
  { heading: 'Delivery Estimates', body: 'Domestic deliveries typically arrive within 2-5 business days. International deliveries typically arrive within 5-14 business days depending on destination and customs processing. These are estimates and not guaranteed delivery dates.' },
  { heading: 'Order Tracking', body: 'Once your order is dispatched, you will receive a tracking number via email. You can track your shipment through the courier website. If you do not receive tracking information within 3 business days of your order, please contact us.' },
  { heading: 'Customs Duties and Taxes', body: 'International orders may be subject to customs duties, import taxes, and handling fees imposed by the destination country. These charges are the responsibility of the recipient and are not included in the product price or shipping cost. We recommend checking with your local customs office for applicable charges.' },
  { heading: 'Shipping Delays', body: 'While we strive to meet delivery estimates, delays may occur due to customs processing, weather conditions, public holidays, or other circumstances beyond our control. We are not liable for delays caused by third-party shipping providers or customs authorities.' },
  { heading: 'Shipping Costs', body: 'Shipping costs are calculated at checkout based on destination, package weight, and selected shipping method. Free shipping may be available for orders above a specified threshold. [Shipping cost thresholds to be confirmed by the business owner.]' },
  { heading: 'Shipping Enquiries', body: 'For any questions about shipping, tracking, or delivery, please contact us through our Contact page or via WhatsApp. Have your order number ready for faster assistance.' },
];

const sectionsAr = [
  { heading: 'وقت المعالجة', body: 'تتم معالجة الطلبات خلال 1-3 أيام عمل من تأكيد الدفع. القطع المخصصة تتطلب وقت إنتاج إضافي سيتم توضيحه وقت الطلب.' },
  { heading: 'طرق الشحن', body: 'نقدم شحناً مؤمّناً من خلال شركات شحن دولية موثوقة. تتطلب جميع الشحنات توقيعاً عند التسليم.' },
  { heading: 'الوجهات المدعومة', body: 'نشحن حالياً إلى معظم الوجهات الدولية. إذا لم تكن دولتك مدرجة عند الدفع، يرجى التواصل معنا. [قائمة الوجهات المدعومة بالكامل لتأكيدها من قبل صاحب العمل.]' },
  { heading: 'تقديرات التسليم', body: 'التسليمات المحلية تصل عادةً خلال 2-5 أيام عمل. التسليمات الدولية تصل خلال 5-14 يوم عمل حسب الوجهة والمعالجة الجمركية.' },
  { heading: 'تتبع الطلب', body: 'بمجرد شحن طلبك، ستصلك رسالة برقم التتبع عبر البريد الإلكتروني. يمكنك تتبع شحنتك عبر موقع شركة الشحن.' },
  { heading: 'الرسوم الجمركية والضرائب', body: 'قد تخضع الطلبات الدولية لرسوم جمركية وضرائب استيراد ورسوم معالجة تفرضها الدولة المستهدفة. هذه الرسوم مسؤولية المستلم وغير مشمولة في سعر المنتج أو تكلفة الشحن.' },
  { heading: 'تأخيرات الشحن', body: 'نبذل قصارى جهدنا لتلبية تقديرات التسليم، لكن قد تحدث تأخيرات بسبب المعالجة الجمركية أو الظروف الجوية أو العطلات العامة.' },
  { heading: 'تكاليف الشحن', body: 'تُحسب تكاليف الشحن عند الدفع بناءً على الوجهة ووزن الطرد وطريقة الشحن المحددة. قد يكون الشحن المجاني متاحاً للطلبات فوق حد معين. [حدود تكلفة الشحن للتأكيد من قبل صاحب العمل.]' },
  { heading: 'استفسارات الشحن', body: 'لأي أسئلة حول الشحن أو التتبع أو التسليم، يرجى التواصل معنا عبر صفحة الاتصال أو واتساب.' },
];

export default function ShippingPage() {
  return <LegalPage titleKey="footer.shipping" sectionsEn={sectionsEn} sectionsAr={sectionsAr} />;
}

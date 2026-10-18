import type { Metadata } from 'next';
import { LegalPage } from '@/components/legal-page';

export const metadata: Metadata = {
  title: 'Privacy Policy — DUGARS Jewellery',
  description: 'How DUGARS Jewellery collects, uses, and protects your personal data. Learn about your privacy rights and our data handling practices.',
  alternates: { canonical: '/privacy' },
  robots: { index: true, follow: true },
};

const sectionsEn = [
  { heading: 'Effective Date', body: 'This Privacy Policy was last updated on 10 October 2026. We may update this policy from time to time. Continued use of our website after changes constitutes acceptance of the updated policy.' },
  { heading: 'Information We Collect', body: 'We collect information you voluntarily provide when you interact with our website: name, email address, phone number, shipping address, and payment details when you place an order or make an enquiry. We also collect information automatically through cookies and similar technologies, including your IP address, browser type, pages visited, and time spent on our site.' },
  { heading: 'Purpose and Legal Basis', body: 'We process your personal data for the following purposes: fulfilling orders and delivering products, responding to enquiries and appointment requests, sending newsletter communications (with your consent), improving our website and services, complying with legal obligations, and preventing fraud. The legal basis for processing includes your consent, contractual necessity, our legitimate business interests, and legal compliance.' },
  { heading: 'Account, Appointment, and Enquiry Information', body: 'When you book an appointment or submit an enquiry, we collect your name, contact details, and any preferences or requirements you share. This information is used solely to provide you with the requested service and is retained for as long as needed to fulfil your request.' },
  { heading: 'Cookies and Analytics', body: 'We use cookies to remember your preferences (such as language and theme), analyse website traffic, and improve your browsing experience. You can control cookies through your browser settings. Disabling cookies may affect some website functionality.' },
  { heading: 'Data Storage and Security', body: 'Your data is stored on secure servers operated by our hosting and infrastructure providers. We use appropriate technical and organisational measures including encryption, access controls, and regular security reviews to protect your data from unauthorised access, alteration, or disclosure.' },
  { heading: 'Data Retention', body: 'We retain your personal data only for as long as necessary to fulfil the purposes for which it was collected, comply with legal obligations, resolve disputes, and enforce our agreements. Newsletter subscribers\' data is retained until you unsubscribe.' },
  { heading: 'Sharing with Service Providers', body: 'We may share your data with trusted third-party service providers who help us operate our business, such as payment processors, shipping carriers, and analytics providers. These providers are bound by confidentiality obligations and may only use your data to provide services to us.' },
  { heading: 'International Data Transfers', body: 'Your information may be transferred to and processed in countries other than your country of residence. We take reasonable steps to ensure that such transfers comply with applicable data protection laws and that adequate safeguards are in place.' },
  { heading: 'Your Privacy Rights', body: 'Depending on your jurisdiction, you may have the right to: access your personal data, request correction of inaccurate data, request deletion of your data, object to or restrict processing, withdraw consent, and request data portability. To exercise any of these rights, please contact us using the details below.' },
  { heading: 'Policy Updates', body: 'We may update this Privacy Policy periodically. We will notify you of significant changes by posting the updated policy on this page. We encourage you to review this page regularly.' },
  { heading: 'Contact Us', body: 'If you have any questions about this Privacy Policy or how we handle your data, please contact us through our Contact page or at the email address listed on our website. [Business contact details to be confirmed by the business owner.]' },
];

const sectionsAr = [
  { heading: 'تاريخ السريان', body: 'تم آخر تحديث لسياسة الخصوصية في 10 أكتوبر 2026. قد نقوم بتحديث هذه السياسة من وقت لآخر. استخدامك المستمر لموقعنا بعد التغييرات يعني قبولك للسياسة المحدثة.' },
  { heading: 'المعلومات التي نجمعها', body: 'نجمع المعلومات التي تقدمها طوعاً عند تفاعلك مع موقعنا: الاسم، البريد الإلكتروني، رقم الهاتف، عنوان الشحن، وتفاصيل الدفع عند تقديم طلب أو استفسار. نجمع أيضاً معلومات تلقائياً من خلال ملفات تعريف الارتباط، بما في ذلك عنوان IP، نوع المتصفح، الصفحات التي تمت زيارتها، ووقت البقاء.' },
  { heading: 'الغرض والأساس القانوني', body: 'نعالج بياناتك الشخصية للأغراض التالية: تلبية الطلبات وتوصيل المنتجات، الرد على الاستفسارات وطلبات المواعيد، إرسال النشرة البريدية (بموافقتك)، تحسين موقعنا وخدماتنا، الامتثال للالتزامات القانونية، ومنع الاحتيال.' },
  { heading: 'معلومات الحساب والمواعيد والاستفسارات', body: 'عند حجز موعد أو تقديم استفسار، نجمع اسمك وتفاصيل الاتصال وأي تفضيلات تشاركها. تُستخدم هذه المعلومات فقط لتقديم الخدمة المطلوبة.' },
  { heading: 'ملفات تعريف الارتباط والتحليلات', body: 'نستخدم ملفات تعريف الارتباط لتذكر تفضيلاتك (مثل اللغة والمظهر)، وتحليل حركة المرور، وتحسين تجربة التصفح. يمكنك التحكم في ملفات تعريف الارتباط من خلال إعدادات المتصفح.' },
  { heading: 'تخزين البيانات والأمان', body: 'تُخزن بياناتك على خوادم آمنة. نستخدم تدابير تقنية وتنظيمية مناسبة بما في ذلك التشفير وضوابط الوصول ومراجعات أمنية منتظمة لحماية بياناتك.' },
  { heading: 'الاحتفاظ بالبيانات', body: 'نحتفظ ببياناتك الشخصية فقط للمدة اللازمة لتلبية الأغراض التي جُمعت من أجلها، والامتثال للالتزامات القانونية، وح解决 النزاعات.' },
  { heading: 'المشاركة مع مزودي الخدمات', body: 'قد نشارك بياناتك مع مزودي خدمات موثوقين يساعدوننا في تشغيل أعمالنا، مثل معالجات الدفع وشركات الشحن ومزودي التحليلات. هؤلاء ملزمون ببنود السرية.' },
  { heading: 'نقل البيانات الدولي', body: 'قد تُنقل معلوماتك وتُعالج في دول أخرى غير بلد إقامتك. نتخذ خطوات معقولة لضمان امتثال هذه النقلات لقوانين حماية البيانات المعمول بها.' },
  { heading: 'حقوق الخصوصية', body: 'اعتماداً على ولايتك القضائية، قد يحق لك: الوصول إلى بياناتك، طلب تصحيح البيانات غير الدقيقة، طلب حذف بياناتك، الاعتراض على المعالجة أو تقييدها، سحب الموافقة، وطلب نقل البيانات.' },
  { heading: 'تحديثات السياسة', body: 'قد نقوم بتحديث سياسة الخصوصية دورياً. سننعك بتغييرات كبيرة من خلال نشر السياسة المحدثة على هذه الصفحة.' },
  { heading: 'اتصل بنا', body: 'إذا كان لديك أسئلة حول سياسة الخصوصية أو كيفية تعاملنا مع بياناتك، يرجى التواصل معنا عبر صفحة الاتصال. [تفاصيل اتصال الأعمال لتأكيدها من قبل صاحب العمل.]' },
];

export default function PrivacyPage() {
  return <LegalPage titleKey="footer.privacy" sectionsEn={sectionsEn} sectionsAr={sectionsAr} />;
}

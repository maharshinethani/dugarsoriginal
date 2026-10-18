import type { Metadata } from 'next';
import { LegalPage } from '@/components/legal-page';

export const metadata: Metadata = {
  title: 'Jewellery Care Guide — DUGARS Jewellery',
  description: 'Expert guidance on storing, cleaning, wearing, and maintaining your fine jewellery. Keep your DUGARS pieces beautiful for generations.',
  alternates: { canonical: '/care-guide' },
  robots: { index: true, follow: true },
};

const sectionsEn = [
  { heading: 'Storage', body: 'Store each piece of jewellery separately in a lined box or soft pouch to prevent scratching and tangling. Avoid storing pieces in areas with high humidity or extreme temperature changes. Keep diamond jewellery separate from other pieces, as diamonds can scratch other gemstones and metals.' },
  { heading: 'Daily Cleaning', body: 'After each wear, gently wipe your jewellery with a soft, lint-free cloth to remove oils, dust, and residues. This simple habit helps maintain the natural lustre of your pieces and prevents buildup that can dull gemstones over time.' },
  { heading: 'Deep Cleaning', body: 'For gold and diamond jewellery, soak in warm water with a few drops of mild dish soap for 10-15 minutes, then gently clean with a soft-bristle brush. Rinse thoroughly with clean water and dry with a soft cloth. For gemstones like emeralds and pearls, use only a damp cloth — never soak them. Avoid ultrasonic cleaners for fragile stones.' },
  { heading: 'What to Avoid', body: 'Remove jewellery before swimming (chlorine damages gold and platinum), exercising (sweat and impact can harm pieces), applying perfumes, lotions, or hairspray (chemicals can tarnish metals and dull gemstones), and doing household cleaning. Always put jewellery on last when dressing and take it off first when undressing.' },
  { heading: 'Gemstone-Specific Care', body: 'Diamonds are durable but can chip on impact. Sapphires and rubies are hard and tolerate gentle cleaning. Emeralds are treated with oils — avoid heat, chemicals, and ultrasonic cleaners. Pearls are delicate — wipe with a soft cloth after wear, store flat, and restring periodically. Opals are sensitive to temperature changes and can crack — store in a slightly humid environment.' },
  { heading: 'Metal Care', body: 'Gold develops a natural patina over time. To restore shine, use a gold polishing cloth. Platinum is durable but can develop a patina — professional polishing restores its finish. Silver tarnishes with exposure to air and sulphur — store in anti-tarnish pouches and use silver polish when needed.' },
  { heading: 'Professional Maintenance', body: 'We recommend bringing your DUGARS jewellery in for professional inspection and cleaning once a year. Our experts check for loose stones, worn prongs, and damaged clasps. Regular maintenance prevents loss and extends the life of your pieces. Contact us to schedule a maintenance appointment.' },
  { heading: 'Travel Tips', body: 'When travelling, pack jewellery in a dedicated travel case with individual compartments. Never pack valuable jewellery in checked luggage — always keep it in your carry-on. Consider insuring valuable pieces before travel.' },
];

const sectionsAr = [
  { heading: 'التخزين', body: 'خزن كل قطعة مجوهرات بشكل منفصل في علبة مبطنة أو كيس ناعم لمنع الخدوش والتشابك. تجنب تخزين القطع في مناطق ذات رطوبة عالية أو تغييرات حادة في درجة الحرارة.' },
  { heading: 'التنظيف اليومي', body: 'بعد كل ارتداء، امسح مجوهراتك بلطف بقطعة قماش ناعمة خالية من الوبر لإزالة الزيوت والأتربة. هذه العادة البسيطة تساعد في الحفاظ على لمعان قطعك الطبيعي.' },
  { heading: 'التنظيف العميق', body: 'للمجوهرات الذهبية والألماس، انقعها في ماء دافئ مع قطرات من صابون لطيف لمدة 10-15 دقيقة، ثم نظفها بلطف بفرشاة ناعمة. اشطف جيداً وجفف بقطعة قماش ناعمة. للأحجار مثل الزمرد واللؤلؤ، استخدم فقط قطعة قماش مبللة — لا تنقعها أبداً.' },
  { heading: 'ما يجب تجنبه', body: 'اخلع المجوهرات قبل السباحة (الكلور يضر الذهب والبلاتين)، التمارين الرياضية، وضع العطور والمستحضرات (المواد الكيميائية يمكن أن تفسد المعادن)، والتنظيف المنزلي. ارتدِ المجوهرات آخر شيء عند التزين واخلعها أول شيء.' },
  { heading: 'رعاية الأحجار الكريمة', body: 'الألماس متين لكن يمكن أن يتشقق عند الاصطدام. الياقوت والزفير صلبان ويتحملان التنظيف اللطيف. الزمورد معالج بالزيوت — تجنب الحرارة والمواد الكيميائية. اللؤلؤ حساس — امسح بقطعة قماش ناعمة وخزنه مسطحاً.' },
  { heading: 'رعاية المعادن', body: 'الذهب يطور عتامة طبيعية مع الوقت. لاستعادة اللمعان، استخدم قطعة تلميع الذهب. البلاتين متين لكن قد يطور عتامة — التلميع الاحترافي يعيد بريقه. الفضة تتأكسد مع التعرض للهواء.' },
  { heading: 'الصيانة الاحترافية', body: 'نوصي بإحضار مجوهرات دوغارس للفحص والتنظيف الاحترافي مرة واحدة سنوياً. يفحص خبراؤنا الأحجار الرخوة والش claws المتآكلة. الصيانة المنتظمة تمنع الفقدان وتطيل عمر قطعك. تواصل معنا لجدولة موعد صيانة.' },
  { heading: 'نصائح السفر', body: 'عند السفر، ضع المجوهرات في علبة سفر مخصصة بجيوب فردية. لا تضع المجوهرات الثمينة في الأمتعة المسجلة — احتفظ بها دائماً في حقيبة اليد. فكر في تأمين القطع الثمينة قبل السفر.' },
];

export default function CareGuidePage() {
  return <LegalPage titleKey="footer.careGuide" sectionsEn={sectionsEn} sectionsAr={sectionsAr} />;
}

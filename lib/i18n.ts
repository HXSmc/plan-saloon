// UI string dictionary for English / Arabic. Keys are flat + namespaced.
// Service/barber/hours content is localized in lib/data.ts (Arabic fields there).

export type Lang = "en" | "ar";

type Dict = Record<string, string>;

const en: Dict = {
  // Header / nav
  "nav.services": "Services",
  "nav.about": "About",
  "nav.team": "Team",
  "nav.visit": "Visit",
  "cta.bookNow": "Book Now",
  "lang.switchTo": "العربية",

  // Hero
  "hero.status": "Now Open · Walk-ins Welcome",
  "hero.headlineA": "Crafting Your",
  "hero.headlineHighlight": "Masterpiece",
  "hero.headlineB": ", One Cut at a Time.",
  "hero.subcopy":
    "Premium cuts, sculpted beards, and classic hot-towel shaves under the warm glow of Action Plan Barbershop. Precision craft, every chair.",
  "hero.viewServices": "View Services",
  "hero.scroll": "Scroll",

  // Services
  "services.eyebrow": "The Menu",
  "services.title": "Services & Pricing",
  "services.subcopy": "Every service finished to the detail. Tap a card to book it.",
  "services.popular": "Popular",
  "services.min": "min",
  "services.bookThis": "Book this",

  // About
  "about.eyebrow": "Inside the Chair",
  "about.title": "A Cut Above, Lit by Warm Glow.",
  "about.p1":
    "Step off the street and into a room of stone, brass, and crystal chandeliers. Action Plan Barbershop blends old-world craft with a modern edge — every appointment a ritual, every finish razor-sharp.",
  "about.p2":
    "Our master barbers take the time to understand your style before the first snip. No rushing. No shortcuts. Just your masterpiece.",
  "about.stat.years": "Years of Craft",
  "about.stat.cuts": "Cuts & Counting",
  "about.stat.rating": "Average Rating",
  "about.interior": "Interior",

  // Team
  "team.eyebrow": "The Crew",
  "team.title": "Meet Your Barbers",
  "team.subcopy": "Hand-picked craftsmen. Book the chair that fits your style.",
  "team.book": "Book",

  // Footer
  "footer.ctaTitleA": "Ready for your",
  "footer.ctaHighlight": "best cut",
  "footer.ctaTitleB": "yet?",
  "footer.ctaButton": "Book Your Chair",
  "footer.blurb":
    "Crafting your masterpiece, one cut at a time. Premium barbering in the heart of downtown.",
  "footer.hours": "Hours",
  "footer.closed": "Closed",
  "footer.findUs": "Find Us",
  "footer.directions": "Get Directions",
  "footer.rights": "All rights reserved.",

  // Booking — shared
  "booking.back": "Back",
  "booking.continue": "Continue",
  "booking.step.service": "Service",
  "booking.step.barber": "Barber",
  "booking.step.time": "Time",
  "booking.step.details": "Details",
  "booking.step.done": "Done",
  "booking.close": "Close",

  // Booking — service step
  "book.service.title": "Choose your service",
  "book.service.subcopy": "Pick what you're in for today.",

  // Booking — barber step
  "book.barber.title": "Pick your barber",
  "book.barber.subcopy": "Or let us match you with the first available chair.",
  "book.barber.firstAvailable": "First Available",
  "book.barber.firstAvailableDesc": "Soonest open slot with any of our barbers.",

  // Booking — calendar step
  "book.cal.title": "Choose a date & time",
  "book.cal.subcopy": "Pick a day, then grab an open slot.",
  "book.cal.selectDate": "Select a date to see available times.",

  // Booking — info step
  "book.info.title": "Your details",
  "book.info.subcopy": "We'll send your confirmation here.",
  "book.info.name": "Full Name",
  "book.info.phone": "Phone",
  "book.info.email": "Email",
  "book.info.confirm": "Confirm Booking",
  "book.err.name": "Please enter your name.",
  "book.err.phone": "Enter a valid phone number.",
  "book.err.email": "Enter a valid email.",

  // Booking — confirm step
  "book.done.title": "You're booked!",
  "book.done.subA": "A confirmation is on its way to",
  "book.done.row.service": "Service",
  "book.done.row.barber": "Barber",
  "book.done.row.when": "When",
  "book.done.row.name": "Name",
  "book.done.at": "at",
  "book.done.demo": "Demo booking — not yet saved to a server.",
  "book.done.another": "Book Another",
  "book.done.done": "Done",
};

const ar: Dict = {
  // Header / nav
  "nav.services": "الخدمات",
  "nav.about": "من نحن",
  "nav.team": "الفريق",
  "nav.visit": "زورونا",
  "cta.bookNow": "احجز الآن",
  "lang.switchTo": "English",

  // Hero
  "hero.status": "مفتوح الآن · يُرحَّب بالزوار",
  "hero.headlineA": "نصنع",
  "hero.headlineHighlight": "تحفتك",
  "hero.headlineB": "، قصّة تلو الأخرى.",
  "hero.subcopy":
    "قصّات فاخرة، ولِحى منحوتة، وحلاقة كلاسيكية بالمنشفة الساخنة تحت الإضاءة الدافئة في صالون أكشن بلان. إتقان ودقّة في كل كرسي.",
  "hero.viewServices": "عرض الخدمات",
  "hero.scroll": "مرّر",

  // Services
  "services.eyebrow": "القائمة",
  "services.title": "الخدمات والأسعار",
  "services.subcopy": "كل خدمة منجزة بأدق التفاصيل. اضغط على البطاقة للحجز.",
  "services.popular": "الأكثر طلبًا",
  "services.min": "دقيقة",
  "services.bookThis": "احجز هذه",

  // About
  "about.eyebrow": "داخل الكرسي",
  "about.title": "تميّز يفوق المعتاد، تحت ضوء دافئ.",
  "about.p1":
    "اخطُ من الشارع إلى قاعة من الحجر والنحاس والثريات الكريستالية. يمزج صالون أكشن بلان بين الحرفة العريقة واللمسة العصرية — كل موعد طقسٌ خاص، وكل لمسةٍ حادّةٌ كالموسى.",
  "about.p2":
    "يأخذ حلّاقونا المحترفون وقتهم لفهم أسلوبك قبل أول قصّة. لا استعجال. لا اختصارات. تحفتك فقط.",
  "about.stat.years": "سنوات من الحرفة",
  "about.stat.cuts": "قصّة وأكثر",
  "about.stat.rating": "متوسط التقييم",
  "about.interior": "المكان",

  // Team
  "team.eyebrow": "الطاقم",
  "team.title": "تعرّف على حلّاقينا",
  "team.subcopy": "حرفيون منتقَون بعناية. احجز الكرسي الذي يناسب أسلوبك.",
  "team.book": "احجز مع",

  // Footer
  "footer.ctaTitleA": "جاهز لأفضل",
  "footer.ctaHighlight": "قصّة",
  "footer.ctaTitleB": "لك؟",
  "footer.ctaButton": "احجز كرسيك",
  "footer.blurb":
    "نصنع تحفتك، قصّة تلو الأخرى. حلاقة فاخرة في قلب المدينة.",
  "footer.hours": "ساعات العمل",
  "footer.closed": "مغلق",
  "footer.findUs": "موقعنا",
  "footer.directions": "احصل على الاتجاهات",
  "footer.rights": "جميع الحقوق محفوظة.",

  // Booking — shared
  "booking.back": "رجوع",
  "booking.continue": "متابعة",
  "booking.step.service": "الخدمة",
  "booking.step.barber": "الحلّاق",
  "booking.step.time": "الوقت",
  "booking.step.details": "البيانات",
  "booking.step.done": "تم",
  "booking.close": "إغلاق",

  // Booking — service step
  "book.service.title": "اختر خدمتك",
  "book.service.subcopy": "اختر ما تريده اليوم.",

  // Booking — barber step
  "book.barber.title": "اختر حلّاقك",
  "book.barber.subcopy": "أو دعنا نرشّح لك أول كرسي متاح.",
  "book.barber.firstAvailable": "أول كرسي متاح",
  "book.barber.firstAvailableDesc": "أقرب موعد متاح مع أيٍّ من حلّاقينا.",

  // Booking — calendar step
  "book.cal.title": "اختر التاريخ والوقت",
  "book.cal.subcopy": "اختر يومًا، ثم احجز موعدًا متاحًا.",
  "book.cal.selectDate": "اختر تاريخًا لعرض الأوقات المتاحة.",

  // Booking — info step
  "book.info.title": "بياناتك",
  "book.info.subcopy": "سنرسل تأكيد الحجز إلى هنا.",
  "book.info.name": "الاسم الكامل",
  "book.info.phone": "الهاتف",
  "book.info.email": "البريد الإلكتروني",
  "book.info.confirm": "تأكيد الحجز",
  "book.err.name": "يرجى إدخال اسمك.",
  "book.err.phone": "أدخل رقم هاتف صحيح.",
  "book.err.email": "أدخل بريدًا إلكترونيًا صحيحًا.",

  // Booking — confirm step
  "book.done.title": "تم حجزك!",
  "book.done.subA": "تأكيد الحجز في طريقه إلى",
  "book.done.row.service": "الخدمة",
  "book.done.row.barber": "الحلّاق",
  "book.done.row.when": "الموعد",
  "book.done.row.name": "الاسم",
  "book.done.at": "الساعة",
  "book.done.demo": "حجز تجريبي — لم يُحفظ على الخادم بعد.",
  "book.done.another": "احجز موعدًا آخر",
  "book.done.done": "تم",
};

export const dict: Record<Lang, Dict> = { en, ar };

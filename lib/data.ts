// Single source of truth for seed content (services, barbers, hours) and the
// shop's static identity. The live site renders from the DB via the API; these
// arrays are the seed source and the instant-paint fallback.

import type { Lang } from "./i18n";

export type Service = {
  id: string;
  name: string;
  name_ar: string;
  description: string;
  description_ar: string;
  price: number;
  icon: string; // key into components/icons.tsx ServiceIcon
  category: string;
  category_ar: string;
  durationMin: number;
  popular?: boolean;
};

export type Barber = {
  id: string;
  name: string;
  name_ar: string;
  title: string;
  title_ar: string;
  bio: string;
  bio_ar: string;
  specialties: string[];
  specialties_ar: string[];
  initials: string;
  imageUrl?: string | null;
};

export const services: Service[] = [
  {
    id: "hair-cut",
    name: "Hair Cut",
    name_ar: "قصّة شعر",
    description:
      "A precision haircut tailored to your style, finished with a hot-towel and styling.",
    description_ar:
      "قصّة دقيقة مفصّلة على أسلوبك، مع لمسة منشفة ساخنة وتصفيف نهائي.",
    price: 25,
    icon: "scissors",
    category: "Hair",
    category_ar: "الشعر",
    durationMin: 45,
    popular: true,
  },
  {
    id: "beard-trim",
    name: "Beard Trim",
    name_ar: "تحديد لحية",
    description:
      "Detailed beard shaping, line-up, and conditioning for a sharp, defined finish.",
    description_ar:
      "تشكيل دقيق للّحية وضبط للخطوط وترطيب للحصول على مظهر حادّ ومحدّد.",
    price: 25,
    icon: "beard",
    category: "Beard & Shave",
    category_ar: "اللحية والحلاقة",
    durationMin: 30,
  },
  {
    id: "cut-beard",
    name: "Cut + Beard Combo",
    name_ar: "قصّة + لحية",
    description:
      "The full reset — signature cut paired with a complete beard sculpt.",
    description_ar: "التجديد الكامل — قصّة مميّزة مع نحت متكامل للّحية.",
    price: 55,
    icon: "combo",
    category: "Packages",
    category_ar: "الباقات",
    durationMin: 90,
    popular: true,
  },
  {
    id: "hot-towel-shave",
    name: "Hot-Towel Shave",
    name_ar: "حلاقة بالمنشفة الساخنة",
    description:
      "Classic straight-razor shave with hot towels and soothing aftercare.",
    description_ar:
      "حلاقة كلاسيكية بالموسى مع مناشف ساخنة وعناية مهدّئة بعد الحلاقة.",
    price: 40,
    icon: "razor",
    category: "Beard & Shave",
    category_ar: "اللحية والحلاقة",
    durationMin: 45,
  },
  {
    id: "kids-cut",
    name: "Kids' Cut",
    name_ar: "قصّة الأطفال",
    description: "Patient, friendly cuts for the next generation (12 & under).",
    description_ar: "قصّات ودودة وبصبر للجيل القادم (12 سنة فأقل).",
    price: 22,
    icon: "kid",
    category: "Kids",
    category_ar: "الأطفال",
    durationMin: 30,
  },
];

export const barbers: Barber[] = [
  {
    id: "mohamed",
    name: "Mohamed",
    name_ar: "محمد",
    title: "Master Barber & Owner",
    title_ar: "حلّاق محترف ومالك",
    bio: "20 years behind the chair. Specialist in classic scissor work and precision fades.",
    bio_ar:
      "عشرون عامًا خلف الكرسي. متخصّص في القصّ الكلاسيكي بالمقص والتدرّجات الدقيقة.",
    specialties: ["Scissor Cuts", "Skin Fades", "Hot-Towel Shaves"],
    specialties_ar: ["قصّ بالمقص", "تدرّج ناعم", "حلاقة بالمنشفة الساخنة"],
    initials: "M",
  },
  {
    id: "sammy",
    name: "Sammy",
    name_ar: "سامي",
    title: "Senior Barber",
    title_ar: "حلّاق أوّل",
    bio: "Detail-obsessed beard artist. If it needs a sharp line-up, Sammy's your man.",
    bio_ar: "فنّان لحى مهووس بالتفاصيل. إن أردت خطوطًا حادّة، فسامي هو رجلك.",
    specialties: ["Beard Sculpting", "Line-ups", "Textured Crops"],
    specialties_ar: ["نحت اللحية", "ضبط الخطوط", "قصّات متدرّجة"],
    initials: "SM",
  },
  {
    id: "saeed",
    name: "Saeed",
    name_ar: "سعيد",
    title: "Barber & Stylist",
    title_ar: "حلّاق ومصفّف",
    bio: "Modern styles and creative designs with a steady, friendly hand.",
    bio_ar: "أنماط عصرية وتصاميم إبداعية بيدٍ ثابتة وودودة.",
    specialties: ["Modern Styles", "Hair Designs", "Kids' Cuts"],
    specialties_ar: ["أنماط عصرية", "تصاميم شعر", "قصّات أطفال"],
    initials: "SA",
  },
];

export type DayHours = {
  day: string;
  day_ar: string;
  open: string;
  close: string;
  closed?: boolean;
};

export const hours: DayHours[] = [
  { day: "Monday", day_ar: "الإثنين", open: "12:00", close: "00:00" },
  { day: "Tuesday", day_ar: "الثلاثاء", open: "12:00", close: "00:00" },
  { day: "Wednesday", day_ar: "الأربعاء", open: "12:00", close: "00:00" },
  { day: "Thursday", day_ar: "الخميس", open: "12:00", close: "00:00" },
  { day: "Friday", day_ar: "الجمعة", open: "13:00", close: "00:00" },
  { day: "Saturday", day_ar: "السبت", open: "12:00", close: "00:00" },
  { day: "Sunday", day_ar: "الأحد", open: "12:00", close: "00:00" },
];

// Ash Shati Al Gharbi, Dammam — approximate shop coordinates for the embed.
const SHOP_LAT = 26.4744;
const SHOP_LON = 50.0605;

export const shopInfo = {
  name: "Action Plan Barbershop",
  phone: "+966 51 104 8719",
  address: "الشاطئ الغربي، الدمام 32413",
  lat: SHOP_LAT,
  lon: SHOP_LON,
  mapEmbed: `https://www.openstreetmap.org/export/embed.html?bbox=${SHOP_LON - 0.012}%2C${SHOP_LAT - 0.008}%2C${SHOP_LON + 0.012}%2C${SHOP_LAT + 0.008}&layer=mapnik&marker=${SHOP_LAT}%2C${SHOP_LON}`,
  mapsLink: `https://maps.google.com/?q=${SHOP_LAT},${SHOP_LON}`,
  // Public Google reviews page — replace with the shop's real place link.
  googleReviewsUrl: `https://www.google.com/maps/search/?api=1&query=Action+Plan+Barbershop+Dammam`,
};

const RIYADH = "Asia/Riyadh";

/** Today as YYYY-MM-DD in shop-local time (works the same in any visitor TZ). */
export function riyadhToday(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: RIYADH,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

/** Minutes since midnight, shop-local. */
function riyadhNowMinutes(): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: RIYADH,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date());
  const [h, m] = parts.split(":").map(Number);
  return h * 60 + m;
}

/** English weekday name ("Monday"…) for a YYYY-MM-DD date. */
export function weekdayName(dateStr: string): string {
  return new Date(dateStr + "T12:00:00Z").toLocaleDateString("en-US", {
    weekday: "long",
    timeZone: "UTC",
  });
}

/**
 * Returns the next `days` calendar dates as YYYY-MM-DD strings (shop-local),
 * skipping any day the shop is closed.
 */
export function upcomingDates(days = 14): string[] {
  const out: string[] = [];
  const cursor = new Date(riyadhToday() + "T00:00:00Z");
  while (out.length < days) {
    const dateStr = cursor.toISOString().slice(0, 10);
    const entry = hours.find((h) => h.day === weekdayName(dateStr));
    if (entry && !entry.closed) out.push(dateStr);
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return out;
}

export type OpenStatus = {
  open: boolean;
  /** "HH:MM" the shop closes (if open) or opens next (if closed). */
  until: string | null;
};

/** Live open/closed state from the published hours, shop-local time. */
export function openStatus(): OpenStatus {
  const today = hours.find((h) => h.day === weekdayName(riyadhToday()));
  if (!today || today.closed) return { open: false, until: null };

  const [oh, om] = today.open.split(":").map(Number);
  const [ch, cm] = today.close.split(":").map(Number);
  const openMin = oh * 60 + om;
  let closeMin = ch * 60 + cm;
  if (closeMin <= openMin) closeMin += 1440; // "00:00" = past-midnight close

  const now = riyadhNowMinutes();
  // A past-midnight close means 00:00–close still belongs to "yesterday's" hours.
  const effectiveNow = now < openMin && closeMin > 1440 ? now + 1440 : now;

  if (effectiveNow >= openMin && effectiveNow < closeMin) {
    return { open: true, until: today.close };
  }
  return { open: false, until: today.open };
}

// Fixed slot grid step (minutes) for the whole shop. Services may run longer
// than one step — availability is duration-aware (see lib/slots.ts).
export const SLOT_MINUTES = 45;

export type Slot = { value: string; label: string };

export function localeFor(lang: Lang): string {
  return lang === "ar" ? "ar" : "en-US";
}

export function formatDateLabel(dateStr: string, lang: Lang = "en"): string {
  const date = new Date(dateStr + "T12:00:00Z");
  return date.toLocaleDateString(localeFor(lang), {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

// Localized field pickers — keep components free of `lang === "ar" ? ...` noise.
export function svcName(s: Service, lang: Lang) {
  return lang === "ar" ? s.name_ar : s.name;
}
export function svcDesc(s: Service, lang: Lang) {
  return lang === "ar" ? s.description_ar : s.description;
}
export function svcCategory(s: Service, lang: Lang) {
  return lang === "ar" ? s.category_ar : s.category;
}
export function barberName(b: Barber, lang: Lang) {
  return lang === "ar" ? b.name_ar : b.name;
}
export function barberTitle(b: Barber, lang: Lang) {
  return lang === "ar" ? b.title_ar : b.title;
}
export function barberBio(b: Barber, lang: Lang) {
  return lang === "ar" ? b.bio_ar : b.bio;
}
export function barberSpecialties(b: Barber, lang: Lang) {
  return lang === "ar" ? b.specialties_ar : b.specialties;
}
export function dayLabel(h: DayHours, lang: Lang) {
  return lang === "ar" ? h.day_ar : h.day;
}

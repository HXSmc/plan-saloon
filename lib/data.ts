// Single source of truth for services, barbers, hours, and slot generation.
// Consumed by Services, Team, and the booking flow — keep all seed data here.

import type { Lang } from "./i18n";

export type Service = {
  id: string;
  name: string;
  name_ar: string;
  description: string;
  description_ar: string;
  price: number;
  icon: string; // emoji used as a lightweight glyph
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
    icon: "✂️",
    popular: true,
  },
  {
    id: "beard-trim",
    name: "Beard Trim",
    name_ar: "دقن",
    description:
      "Detailed beard shaping, line-up, and conditioning for a sharp, defined finish.",
    description_ar:
      "تشكيل دقيق للّحية وضبط للخطوط وترطيب للحصول على مظهر حادّ ومحدّد.",
    price: 25,
    icon: "🧔",
  },
  {
    id: "cut-beard",
    name: "Cut + Beard Combo",
    name_ar: "قصّة + لحية",
    description:
      "The full reset — signature cut paired with a complete beard sculpt.",
    description_ar:
      "التجديد الكامل — قصّة مميّزة مع نحت متكامل للّحية.",
    price: 55,
    icon: "💈",
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
    icon: "🪒",
  },
  {
    id: "kids-cut",
    name: "Kids' Cut",
    name_ar: "قصّة الأطفال",
    description:
      "Patient, friendly cuts for the next generation (12 & under).",
    description_ar:
      "قصّات ودودة وبصبر للجيل القادم (12 سنة فأقل).",
    price: 22,
    icon: "🧒",
  },
];

export const barbers: Barber[] = [
  {
    id: "mohamed",
    name: "mohamed",
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
    name: "sammy",
    name_ar: "سامي",
    title: "Senior Barber",
    title_ar: "حلّاق أوّل",
    bio: "Detail-obsessed beard artist. If it needs a sharp line-up, Diego's your man.",
    bio_ar:
      "فنّان لحى مهووس بالتفاصيل. إن أردت خطوطًا حادّة، فدييغو هو رجلك.",
    specialties: ["Beard Sculpting", "Line-ups", "Textured Crops"],
    specialties_ar: ["نحت اللحية", "ضبط الخطوط", "قصّات متدرّجة"],
    initials: "SM",
  },
  {
    id: "saeed",
    name: "saeed",
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

export const shopInfo = {
  name: "Action Plan Barbershop",
  phone: "+966 51 104 8719",
  address: "الشاطئ الغربي، الدمام 32413",
  // Generic embeddable map (no API key required).
  mapEmbed:
    "https://www.openstreetmap.org/export/embed.html?bbox=-0.13%2C51.50%2C-0.11%2C51.52&layer=mapnik",
  mapsLink: "https://maps.google.com/?q=Action+Plan+Barbershop",
};

/**
 * Returns the next `days` calendar dates as YYYY-MM-DD strings, skipping any
 * day the shop is closed.
 */
export function upcomingDates(days = 14, from: Date = new Date()): string[] {
  const out: string[] = [];
  const cursor = new Date(from);
  while (out.length < days) {
    const dayName = cursor.toLocaleDateString("en-US", { weekday: "long" });
    const entry = hours.find((h) => h.day === dayName);
    if (entry && !entry.closed) {
      out.push(cursor.toISOString().slice(0, 10));
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return out;
}

// Fixed slot length (minutes) for the whole shop. Slot startTime is the booking key.
export const SLOT_MINUTES = 45;

export type Slot = { value: string; label: string };

// Formats minutes-from-midnight → 24h "HH:MM" value + 12h "h:MM AM/PM" label.
function minutesToSlot(m: number): Slot {
  const mod = ((m % 1440) + 1440) % 1440;
  const h24 = Math.floor(mod / 60);
  const min = mod % 60;
  const period = h24 >= 12 ? "PM" : "AM";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return {
    value: `${String(h24).padStart(2, "0")}:${String(min).padStart(2, "0")}`,
    label: `${h12}:${String(min).padStart(2, "0")} ${period}`,
  };
}

/**
 * Generates bookable {value,label} slots for a date, stepping by SLOT_MINUTES
 * within that day's opening hours. A `close` of "00:00" means midnight (end of
 * day) — treated as 1440 so the final evening slots are produced.
 */
export function slotsForDate(
  dateStr: string,
  durationMin = SLOT_MINUTES
): Slot[] {
  const date = new Date(dateStr + "T00:00:00");
  const dayName = date.toLocaleDateString("en-US", { weekday: "long" });
  const entry = hours.find((h) => h.day === dayName);
  if (!entry || entry.closed) return [];

  const [openH, openM] = entry.open.split(":").map(Number);
  const [closeH, closeM] = entry.close.split(":").map(Number);
  const start = openH * 60 + openM;
  let end = closeH * 60 + closeM;
  if (end <= start) end += 1440; // "00:00" / past-midnight close

  const slots: Slot[] = [];
  for (let m = start; m + durationMin <= end; m += durationMin) {
    slots.push(minutesToSlot(m));
  }
  return slots;
}

export function localeFor(lang: Lang): string {
  return lang === "ar" ? "ar" : "en-US";
}

export function formatDateLabel(dateStr: string, lang: Lang = "en"): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString(localeFor(lang), {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

// Localized field pickers — keep components free of `lang === "ar" ? ...` noise.
export function svcName(s: Service, lang: Lang) {
  return lang === "ar" ? s.name_ar : s.name;
}
export function svcDesc(s: Service, lang: Lang) {
  return lang === "ar" ? s.description_ar : s.description;
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

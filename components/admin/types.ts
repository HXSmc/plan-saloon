export type AdminAppointment = {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  startTime: string;
  endTime: string;
  status: string;
  revenue: number;
  source: string;
  serviceId: string;
  barberId: string;
  service: { id: string; name: string; price: number; durationMin: number };
  barber: { id: string; name: string; initials: string };
};

export type AdminService = {
  id: string;
  name: string;
  name_ar: string;
  description: string;
  description_ar: string;
  price: number;
  icon: string;
  category: string;
  category_ar: string;
  popular: boolean;
  durationMin: number;
  active: boolean;
};

export type AdminBarber = {
  id: string;
  name: string;
  name_ar: string;
  title: string;
  title_ar: string;
  bio: string;
  bio_ar: string;
  initials: string;
  imageUrl: string | null;
  phone: string | null;
  active: boolean;
  loginEmail: string | null;
  specialties: string[];
  specialties_ar: string[];
  serviceIds: string[];
  workingHours: {
    id: string;
    weekday: number;
    startMin: number;
    endMin: number;
    isOff: boolean;
  }[];
  timeOff: { id: string; start: string; end: string; reason: string | null }[];
};

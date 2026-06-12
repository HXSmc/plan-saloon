"use client";

import { useEffect, useState } from "react";

export type ApiService = {
  id: string;
  name: string;
  name_ar: string;
  description: string;
  description_ar: string;
  price: number;
  icon: string;
  popular: boolean;
  durationMin: number;
};

export type ApiBarber = {
  id: string;
  name: string;
  name_ar: string;
  title: string;
  title_ar: string;
  bio: string;
  bio_ar: string;
  initials: string;
  specialties: string[];
  specialties_ar: string[];
};

// Loads active services + barbers from the API so the booking flow reflects
// current admin edits / active staff. Falls back to empty arrays on error.
export function useCatalog() {
  const [services, setServices] = useState<ApiService[]>([]);
  const [barbers, setBarbers] = useState<ApiBarber[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    Promise.all([
      fetch("/api/services").then((r) => r.json()),
      fetch("/api/barbers").then((r) => r.json()),
    ])
      .then(([s, b]) => {
        if (!alive) return;
        setServices(Array.isArray(s) ? s : []);
        setBarbers(Array.isArray(b) ? b : []);
      })
      .catch(() => {})
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  return { services, barbers, loading };
}

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
  category: string;
  category_ar: string;
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
  imageUrl: string | null;
  specialties: string[];
  specialties_ar: string[];
};

type Catalog = { services: ApiService[]; barbers: ApiBarber[] };

// One in-flight/settled fetch per page load, shared by every useCatalog()
// consumer (Services, Team, the booking steps, the summary rail) — otherwise
// each mount would hit both endpoints again.
let catalogPromise: Promise<Catalog> | null = null;

function loadCatalog(): Promise<Catalog> {
  if (!catalogPromise) {
    catalogPromise = Promise.all([
      fetch("/api/services").then((r) => r.json()),
      fetch("/api/barbers").then((r) => r.json()),
    ])
      .then(([s, b]) => ({
        services: Array.isArray(s) ? (s as ApiService[]) : [],
        barbers: Array.isArray(b) ? (b as ApiBarber[]) : [],
      }))
      .catch(() => {
        catalogPromise = null; // allow a retry on the next mount
        return { services: [], barbers: [] };
      });
  }
  return catalogPromise;
}

// Loads active services + barbers from the API so the booking flow reflects
// current admin edits / active staff. Falls back to empty arrays on error.
export function useCatalog() {
  const [catalog, setCatalog] = useState<Catalog>({ services: [], barbers: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    loadCatalog().then((c) => {
      if (!alive) return;
      setCatalog(c);
      setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, []);

  return { ...catalog, loading };
}

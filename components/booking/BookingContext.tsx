"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

export type BookingStep = 1 | 2 | 3 | 4 | 5;

export type ContactInfo = { name: string; phone: string; email: string };

export type BookingState = {
  serviceId: string | null;
  barberId: string | null; // null === "First Available"
  date: string | null; // YYYY-MM-DD
  time: string | null; // e.g. "10:30 AM"
  contact: ContactInfo;
};

type OpenOptions = { serviceId?: string; barberId?: string };

type BookingContextValue = {
  isOpen: boolean;
  step: BookingStep;
  state: BookingState;
  open: (opts?: OpenOptions) => void;
  close: () => void;
  goTo: (step: BookingStep) => void;
  next: () => void;
  back: () => void;
  set: (patch: Partial<BookingState>) => void;
  reset: () => void;
};

const emptyState: BookingState = {
  serviceId: null,
  barberId: null,
  date: null,
  time: null,
  contact: { name: "", phone: "", email: "" },
};

const BookingContext = createContext<BookingContextValue | null>(null);

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<BookingStep>(1);
  const [state, setState] = useState<BookingState>(emptyState);

  const open = useCallback((opts?: OpenOptions) => {
    setState({
      ...emptyState,
      serviceId: opts?.serviceId ?? null,
      barberId: opts?.barberId ?? null,
    });
    // If a service was preselected, jump straight to barber selection.
    setStep(opts?.serviceId ? 2 : 1);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => setIsOpen(false), []);
  const reset = useCallback(() => {
    setState(emptyState);
    setStep(1);
  }, []);

  const goTo = useCallback((s: BookingStep) => setStep(s), []);
  const next = useCallback(
    () => setStep((s) => (Math.min(5, s + 1) as BookingStep)),
    []
  );
  const back = useCallback(
    () => setStep((s) => (Math.max(1, s - 1) as BookingStep)),
    []
  );
  const set = useCallback(
    (patch: Partial<BookingState>) => setState((prev) => ({ ...prev, ...patch })),
    []
  );

  const value = useMemo(
    () => ({ isOpen, step, state, open, close, goTo, next, back, set, reset }),
    [isOpen, step, state, open, close, goTo, next, back, set, reset]
  );

  return (
    <BookingContext.Provider value={value}>{children}</BookingContext.Provider>
  );
}

export function useBooking() {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error("useBooking must be used within a BookingProvider");
  return ctx;
}

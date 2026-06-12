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
  time: string | null; // 24h slot value, e.g. "22:30" (sent to API)
  timeLabel: string | null; // display label, e.g. "10:30 PM"
  contact: ContactInfo;
};

type BookingContextValue = {
  step: BookingStep;
  state: BookingState;
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
  timeLabel: null,
  contact: { name: "", phone: "", email: "" },
};

const BookingContext = createContext<BookingContextValue | null>(null);

export function BookingProvider({
  children,
  initialServiceId = null,
  initialBarberId = null,
}: {
  children: React.ReactNode;
  /** Preselections from /book?service=…&barber=… deep links. */
  initialServiceId?: string | null;
  initialBarberId?: string | null;
}) {
  const [state, setState] = useState<BookingState>({
    ...emptyState,
    serviceId: initialServiceId,
    barberId: initialBarberId,
  });
  // A preselected service deep-link skips straight to barber choice.
  const [step, setStep] = useState<BookingStep>(initialServiceId ? 2 : 1);

  const reset = useCallback(() => {
    setState(emptyState);
    setStep(1);
  }, []);

  const goTo = useCallback((s: BookingStep) => setStep(s), []);
  const next = useCallback(
    () => setStep((s) => Math.min(5, s + 1) as BookingStep),
    []
  );
  const back = useCallback(
    () => setStep((s) => Math.max(1, s - 1) as BookingStep),
    []
  );
  const set = useCallback(
    (patch: Partial<BookingState>) =>
      setState((prev) => ({ ...prev, ...patch })),
    []
  );

  const value = useMemo(
    () => ({ step, state, goTo, next, back, set, reset }),
    [step, state, goTo, next, back, set, reset]
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

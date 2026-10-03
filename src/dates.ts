import { useEffect, useState } from "react";

/** Local-time "YYYY-MM-DD" key. All day-level data is keyed by this. */
export function toKey(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export function fromKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(key: string, n: number): string {
  const d = fromKey(key);
  d.setDate(d.getDate() + n);
  return toKey(d);
}

/** Monday of the week containing `key`. */
export function startOfWeek(key: string): string {
  const mondayOffset = (fromKey(key).getDay() + 6) % 7;
  return addDays(key, -mondayOffset);
}

export function weekDays(key: string): string[] {
  const monday = startOfWeek(key);
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
}

export function formatDay(key: string, opts: Intl.DateTimeFormatOptions): string {
  return fromKey(key).toLocaleDateString(undefined, opts);
}

/** Today's key, re-rendering when the date rolls over at midnight. */
export function useToday(): string {
  const [today, setToday] = useState(() => toKey(new Date()));
  useEffect(() => {
    const id = setInterval(() => setToday(toKey(new Date())), 30_000);
    return () => clearInterval(id);
  }, []);
  return today;
}

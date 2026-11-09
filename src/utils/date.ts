/** Datas sem hora no formato da API (`YYYY-MM-DD`), sempre no fuso local — sem surpresas de UTC. */

function pad(value: number) {
  return String(value).padStart(2, '0');
}

export function toISODate(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** `YYYY-MM-DD` → `Date` à meia-noite local. */
export function parseISODate(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function todayISO(now = new Date()): string {
  return toISODate(now);
}

export function addDaysISO(value: string, days: number): string {
  const date = parseISODate(value);
  date.setDate(date.getDate() + days);
  return toISODate(date);
}

/** Dias de `from` até `to` (negativo se `to` é antes). */
export function daysBetweenISO(from: string, to: string): number {
  return Math.round((parseISODate(to).getTime() - parseISODate(from).getTime()) / 86_400_000);
}

export function formatISODate(value: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, { dateStyle: 'short' }).format(parseISODate(value));
}

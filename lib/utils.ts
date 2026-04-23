import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCountdown(examDate?: string | null) {
  if (!examDate) {
    return "Choose your exam date";
  }

  const today = new Date();
  const target = new Date(examDate);
  const diff = Math.ceil((target.getTime() - today.getTime()) / 86_400_000);

  if (diff < 0) {
    return "Exam date has passed";
  }

  return `${diff} days to go`;
}

export function percent(part: number, whole: number) {
  if (!whole) {
    return 0;
  }

  return Math.round((part / whole) * 100);
}

export function titleCase(value: string) {
  return value.replace(/(^|\s)\S/g, (char) => char.toUpperCase());
}

export function generateId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}


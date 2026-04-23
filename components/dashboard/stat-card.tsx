import type { ReactNode } from "react";

export function StatCard({
  label,
  value,
  hint,
  icon
}: {
  label: string;
  value: string;
  hint: string;
  icon: ReactNode;
}) {
  return (
    <article className="rounded-[28px] bg-white p-5 shadow-soft">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-ink-500">{label}</p>
        <div className="rounded-2xl bg-brand-50 p-3 text-brand-700">{icon}</div>
      </div>
      <p className="mt-4 text-3xl font-bold text-ink-900">{value}</p>
      <p className="mt-2 text-sm text-ink-500">{hint}</p>
    </article>
  );
}


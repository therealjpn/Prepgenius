import type { ReactNode } from "react";
import { BottomNav } from "@/components/layout/bottom-nav";
import { BrandLockup } from "@/components/layout/brand-lockup";

export function AppShell({
  title,
  subtitle,
  children
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-hero-glow pb-28">
      <section className="mx-auto flex max-w-3xl flex-col gap-6 px-4 pb-8 pt-6">
        <header className="rounded-[28px] bg-brand-900 px-5 py-6 text-white shadow-soft">
          <BrandLockup />
          <h1 className="mt-6 text-3xl font-bold">{title}</h1>
          {subtitle ? <p className="mt-2 max-w-xl text-sm text-brand-100">{subtitle}</p> : null}
        </header>
        {children}
      </section>
      <BottomNav />
    </main>
  );
}

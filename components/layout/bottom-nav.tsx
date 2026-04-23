"use client";

import Link from "next/link";
import { BookOpen, Brain, House, Rocket, UserRound } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const items = [
  { href: "/dashboard", label: "Home", icon: House },
  { href: "/practice", label: "Practice", icon: BookOpen },
  { href: "/mock-exams", label: "Mocks", icon: Rocket },
  { href: "/tutor", label: "AI Tutor", icon: Brain },
  { href: "/profile", label: "Profile", icon: UserRound }
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-brand-100 bg-white/95 px-4 py-3 backdrop-blur">
      <div className="mx-auto grid max-w-3xl grid-cols-5 gap-2">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-xs font-semibold transition",
                active ? "bg-brand-700 text-white" : "text-ink-500 hover:bg-brand-50"
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}


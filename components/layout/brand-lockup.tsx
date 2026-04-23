import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function BrandLockup({
  theme = "light",
  showTagline = true,
  href = "/"
}: {
  theme?: "light" | "dark";
  showTagline?: boolean;
  href?: string;
}) {
  const textClassName = theme === "light" ? "text-white" : "text-ink-900";
  const subtextClassName = theme === "light" ? "text-brand-100" : "text-ink-500";
  const iconClassName = theme === "light" ? "bg-white/10" : "bg-brand-50";

  return (
    <Link href={href} className="inline-flex items-center gap-3">
      <div className={cn("rounded-2xl p-2", iconClassName)}>
        <Image src="/icon.svg" alt="PrepGenius logo" width={48} height={48} className="h-12 w-12" priority />
      </div>
      <div>
        <p className={cn("text-sm font-semibold uppercase tracking-[0.24em]", textClassName)}>PrepGenius</p>
        {showTagline ? <p className={cn("text-sm", subtextClassName)}>AI exam prep on web and WhatsApp</p> : null}
      </div>
    </Link>
  );
}

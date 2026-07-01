import Link from "next/link";
import type { Route } from "next";

import { cn } from "@/lib/utils";

type ActionCardProps = {
  title: string;
  description: string;
  icon: string;
  buttonLabel: string;
  toneClassName: string;
  buttonVariant?: "primary" | "secondary";
  href?: Route;
};

export function ActionCard({
  title,
  description,
  icon,
  buttonLabel,
  toneClassName,
  buttonVariant = "primary",
  href,
}: ActionCardProps) {
  const buttonClassName = cn(
    "relative mt-6 w-fit rounded-full px-5 py-2.5 font-button text-button transition-colors",
    buttonVariant === "primary"
      ? "bg-primary text-on-primary hover:bg-tertiary-container"
      : "border border-border-subtle bg-surface-card text-primary hover:bg-surface-container-low"
  );

  return (
    <article
      className={cn(
        "group relative flex min-h-[220px] flex-col justify-between overflow-hidden rounded-[24px] border border-white/50 p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] transition-transform hover:-translate-y-1",
        toneClassName
      )}
    >
      <div className="absolute right-0 top-0 -mr-8 -mt-8 h-32 w-32 rounded-bl-[100px] bg-white/30" />
      <div className="relative">
        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-white">
          <span className="material-symbols-outlined text-secondary">{icon}</span>
        </div>
        <h3 className="font-heading-sm text-heading-sm text-text-primary">{title}</h3>
        <p className="mt-1 pr-12 font-body-sm text-body-sm text-text-secondary">{description}</p>
      </div>
      {href ? (
        <Link className={buttonClassName} href={href}>
          {buttonLabel}
        </Link>
      ) : (
        <button className={buttonClassName} type="button">
          {buttonLabel}
        </button>
      )}
    </article>
  );
}

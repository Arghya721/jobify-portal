import Image from "next/image";

import { cn } from "@/lib/utils";

type BrandLogoProps = {
  className?: string;
  priority?: boolean;
};

export function BrandLogo({ className, priority = false }: BrandLogoProps) {
  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 overflow-hidden rounded-lg bg-foreground/10 shadow-sm ring-1 ring-border/50",
        className
      )}
      aria-hidden="true"
    >
      <Image
        src="/jobify-mark-light.png"
        alt="Jobify logo"
        fill
        sizes="40px"
        priority={priority}
        className="object-cover dark:hidden"
      />
      <Image
        src="/jobify-mark-dark.png"
        alt="Jobify logo"
        fill
        sizes="40px"
        priority={priority}
        className="hidden object-cover dark:block"
      />
    </span>
  );
}

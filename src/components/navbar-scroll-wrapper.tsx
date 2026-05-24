"use client";

import { useEffect, useState } from "react";

export function NavbarScrollWrapper({ children }: { children: React.ReactNode }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      data-scrolled={scrolled}
      className="contents [&[data-scrolled=true]>header]:border-border/60 [&[data-scrolled=true]>header]:shadow-[0_1px_24px_rgba(0,0,0,0.12)]"
    >
      {children}
    </div>
  );
}

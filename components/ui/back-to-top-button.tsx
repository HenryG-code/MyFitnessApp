"use client";

import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export function BackToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setIsVisible(window.scrollY > 300);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    });
  }

  return (
    <button
      type="button"
      aria-label="Back to top"
      onClick={scrollToTop}
      className={`fixed right-4 z-50 grid size-12 place-items-center rounded-2xl border border-accent/30 bg-accent text-white shadow-[0_18px_60px_rgba(0,0,0,0.42)] transition duration-200 hover:-translate-y-0.5 hover:bg-accent-strong focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/25 lg:bottom-6 ${
        isVisible
          ? "bottom-40 translate-y-0 opacity-100"
          : "pointer-events-none bottom-36 translate-y-3 opacity-0"
      }`}
    >
      <ArrowUp className="size-5" />
    </button>
  );
}

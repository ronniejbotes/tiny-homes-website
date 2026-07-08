"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronDown, Menu, X, Phone } from "lucide-react";
import { nav, site } from "@/lib/site";
import { cn } from "@/lib/cn";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menus on navigation (render-time state adjustment, per React docs)
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setMobileOpen(false);
    setProductsOpen(false);
  }

  // Lock body scroll while the mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // Focus management while the mobile menu is open: Escape closes the menu
  // and returns focus to the toggle, and the page content behind the overlay
  // is made inert so keyboard focus stays contained in the panel.
  useEffect(() => {
    if (!mobileOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);

    const background = [
      document.getElementById("main"),
      document.querySelector<HTMLElement>("footer"),
      document.querySelector<HTMLElement>('a[aria-label*="WhatsApp"]'),
    ].filter((el): el is HTMLElement => el !== null);
    for (const el of background) el.inert = true;

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      for (const el of background) el.inert = false;
    };
  }, [mobileOpen]);

  const isProductActive = nav.products.some((p) => pathname === `/${p.slug}`);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled || mobileOpen
          ? "bg-cream/90 backdrop-blur-md border-b border-border shadow-[0_1px_0_rgba(28,27,23,0.04)]"
          : "bg-transparent",
      )}
    >
      <nav
        aria-label="Main"
        className="mx-auto flex h-16 sm:h-20 w-full max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-12"
      >
        <Link href="/" className="flex items-center gap-2.5" aria-label="Tiny Homes SA — home">
          <HomeMark className="h-8 w-8 text-forest" />
          <span className="font-display text-xl font-semibold tracking-tight text-ink">
            Tiny Homes <span className="text-clay">SA</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-1 lg:flex">
          <div
            className="relative"
            onMouseEnter={() => setProductsOpen(true)}
            onMouseLeave={() => setProductsOpen(false)}
          >
            <button
              type="button"
              aria-expanded={productsOpen}
              aria-haspopup="true"
              onClick={() => setProductsOpen((v) => !v)}
              className={cn(
                "flex cursor-pointer items-center gap-1 rounded-full px-4 py-2 text-[0.9375rem] font-medium transition-colors hover:bg-ink/5",
                isProductActive ? "text-clay" : "text-ink",
              )}
            >
              Our Homes
              <ChevronDown
                className={cn("h-4 w-4 transition-transform duration-200", productsOpen && "rotate-180")}
              />
            </button>
            <AnimatePresence>
              {productsOpen && (
                <motion.div
                  initial={reduce ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduce ? undefined : { opacity: 0, y: 6 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  className="absolute left-1/2 top-full w-64 -translate-x-1/2 pt-3"
                >
                  <div className="overflow-hidden rounded-2xl border border-border bg-cream p-2 shadow-[var(--shadow-lifted)]">
                    {nav.products.map((p) => (
                      <Link
                        key={p.slug}
                        href={`/${p.slug}`}
                        className={cn(
                          "block rounded-xl px-4 py-2.5 text-[0.9375rem] font-medium transition-colors hover:bg-sand/60",
                          pathname === `/${p.slug}` ? "text-clay" : "text-ink",
                        )}
                      >
                        {p.label}
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {nav.pages.map((page) => (
            <Link
              key={page.href}
              href={page.href}
              className={cn(
                "rounded-full px-4 py-2 text-[0.9375rem] font-medium transition-colors hover:bg-ink/5",
                pathname === page.href ? "text-clay" : "text-ink",
              )}
            >
              {page.label}
            </Link>
          ))}

          <a
            href={`tel:${site.phone.replace(/\s/g, "")}`}
            className="ml-2 flex items-center gap-2 rounded-full px-4 py-2 text-[0.9375rem] font-medium text-ink transition-colors hover:bg-ink/5"
          >
            <Phone className="h-4 w-4 text-clay" />
            {site.phoneDisplay}
          </a>

          <Link
            href="/contact"
            className="ml-2 inline-flex h-11 cursor-pointer items-center rounded-full bg-forest px-6 text-[0.9375rem] font-medium text-cream shadow-[var(--shadow-soft)] transition-all duration-200 hover:-translate-y-px hover:bg-forest-light"
          >
            Get a Quote
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          ref={toggleRef}
          type="button"
          className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full text-ink transition-colors hover:bg-ink/5 lg:hidden"
          aria-expanded={mobileOpen}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          onClick={() => setMobileOpen((v) => !v)}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            initial={reduce ? false : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={reduce ? undefined : { opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden border-t border-border bg-cream lg:hidden"
          >
            <div className="max-h-[calc(100dvh-4rem)] overflow-y-auto px-5 pb-8 pt-4">
              <p className="text-eyebrow mb-2 mt-2 text-stone">Our Homes</p>
              {nav.products.map((p) => (
                <Link
                  key={p.slug}
                  href={`/${p.slug}`}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "block rounded-xl px-3 py-3 text-lg font-medium",
                    pathname === `/${p.slug}` ? "text-clay" : "text-ink",
                  )}
                >
                  {p.label}
                </Link>
              ))}
              <div className="my-4 border-t border-border" />
              {nav.pages.map((page) => (
                <Link
                  key={page.href}
                  href={page.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "block rounded-xl px-3 py-3 text-lg font-medium",
                    pathname === page.href ? "text-clay" : "text-ink",
                  )}
                >
                  {page.label}
                </Link>
              ))}
              <div className="mt-6 flex flex-col gap-3">
                <Link
                  href="/contact"
                  onClick={() => setMobileOpen(false)}
                  className="inline-flex h-13 items-center justify-center rounded-full bg-forest px-8 text-base font-medium text-cream"
                >
                  Get a Quote
                </Link>
                <a
                  href={`tel:${site.phone.replace(/\s/g, "")}`}
                  onClick={() => setMobileOpen(false)}
                  className="inline-flex h-13 items-center justify-center gap-2 rounded-full border border-ink/20 px-8 text-base font-medium text-ink"
                >
                  <Phone className="h-4 w-4 text-clay" /> {site.phoneDisplay}
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

/** Simple tiny-house mark: gabled cabin in a rounded square. */
function HomeMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
      <rect x="1.5" y="1.5" width="29" height="29" rx="8" stroke="currentColor" strokeWidth="2" />
      <path
        d="M8.5 16.5 16 10l7.5 6.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.5 15.5V22a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1v-6.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path d="M14.5 23v-4.5a1.5 1.5 0 0 1 3 0V23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

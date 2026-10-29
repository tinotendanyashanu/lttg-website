"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const links = [
  { href: "/services", label: "Services" },
  { href: "/portfolio", label: "Our work" },
  { href: "/how-i-work", label: "How it works" },
  { href: "/about", label: "About Leo" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, []);
  return (
    <header className="site-header">
      <nav className="marketing-container" aria-label="Main navigation">
        <div className="flex h-20 items-center justify-between gap-6">
          <Link
            href="/"
            onClick={() => setIsOpen(false)}
            className="flex shrink-0 items-center gap-2 text-base font-bold tracking-tight text-slate-950"
          >
            <Image
              src="/logo_symbo.png"
              alt=""
              width={32}
              height={32}
              className="h-8 w-8 object-contain"
            />
            LeoTheTechGuy<span className="text-emerald-700">.</span>
          </Link>
          <div className="hidden items-center gap-7 lg:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={pathname === link.href ? "page" : undefined}
                className={`text-sm transition-colors hover:text-emerald-700 ${pathname === link.href ? "font-semibold text-slate-950" : "text-slate-600"}`}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <Link
            href="/book"
            className="marketing-button button-dark hidden !min-h-11 !px-5 !py-3 !text-xs lg:inline-flex"
          >
            Let’s talk <ArrowUpRight className="h-4 w-4" />
          </Link>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={isOpen}
            aria-controls="mobile-navigation"
            className="rounded-lg p-3 text-slate-950 lg:hidden"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
        {isOpen && (
          <div
            id="mobile-navigation"
            className="border-t border-slate-200 pb-6 pt-3 lg:hidden"
          >
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="block rounded-lg px-2 py-3 text-base text-slate-700"
                aria-current={pathname === link.href ? "page" : undefined}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/contact"
              onClick={() => setIsOpen(false)}
              className="block px-2 py-3 text-slate-700"
            >
              Request an estimate
            </Link>
            <Link
              href="/book"
              onClick={() => setIsOpen(false)}
              className="marketing-button button-dark mt-3 w-full"
            >
              Book a discovery call <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}

"use client";

import { useState, useEffect, type MouseEvent } from "react";
import Link from "next/link";
import { ArrowLeft, Menu, X } from "lucide-react";
import { NoosHardwareLogo } from "@/components/noos-hardware-logo";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleHomeClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    setIsMenuOpen(false);
    setIsLeaving(true);

    window.setTimeout(() => {
      if (window.top) {
        window.top.location.href = "/?main=true";
        return;
      }

      window.location.href = "/?main=true";
    }, 520);
  };

  return (
    <>
      <a
        href="/?main=true"
        target="_top"
        aria-label="NOOS 홈으로 돌아가기"
        onClick={handleHomeClick}
        className={`fixed left-4 top-4 z-[70] inline-flex h-11 min-w-11 items-center justify-center gap-2 rounded-full border px-3 text-sm font-medium backdrop-blur-md transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/30 md:left-5 md:top-5 md:px-4 ${
          isScrolled
            ? "border-border bg-background/85 text-foreground shadow-[0_10px_30px_rgba(0,0,0,0.08)] hover:bg-background"
            : "border-white/40 bg-white/85 text-black shadow-[0_12px_36px_rgba(0,0,0,0.18)] hover:bg-white"
        }`}
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={1.8} />
        <span className="hidden sm:inline">홈</span>
      </a>

      {isLeaving && (
        <div
          aria-hidden="true"
          className="fixed inset-0 z-[9999] bg-black"
          style={{
            animation: "noos-ai-objet-veil-in 520ms ease-in-out forwards",
          }}
        />
      )}

      <header 
        className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-3xl transition-all duration-300 ${isScrolled ? "bg-background/80 backdrop-blur-md rounded-full" : "bg-transparent"}`}
        style={{
          boxShadow: isScrolled ? "rgba(14, 63, 126, 0.04) 0px 0px 0px 1px, rgba(42, 51, 69, 0.04) 0px 1px 1px -0.5px, rgba(42, 51, 70, 0.04) 0px 3px 3px -1.5px, rgba(42, 51, 70, 0.04) 0px 6px 6px -3px, rgba(14, 63, 126, 0.04) 0px 12px 12px -6px, rgba(14, 63, 126, 0.04) 0px 24px 24px -12px" : "none"
        }}
      >
      <div className="flex items-center justify-between transition-all duration-300 px-2 py-2 pl-16 md:pl-5">
        {/* Logo */}
        <Link
          href="#hero"
          className="flex items-center transition-opacity duration-300 hover:opacity-70"
          aria-label="NOOS AI Objet 홈"
        >
          <NoosHardwareLogo />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-10 md:flex">
          <Link
            href="#form"
            className="text-sm transition-colors text-muted-foreground hover:text-foreground"
          >
            형태
          </Link>
          <Link
            href="#hardware"
            className="text-sm transition-colors text-muted-foreground hover:text-foreground"
          >
            하드웨어
          </Link>
          <Link
            href="#gallery"
            className="text-sm transition-colors text-muted-foreground hover:text-foreground"
          >
            렌더
          </Link>
          <Link
            href="#system"
            className="text-sm transition-colors text-muted-foreground hover:text-foreground"
          >
            시스템
          </Link>
        </nav>

        {/* CTA */}
        <div className="hidden items-center gap-6 md:flex">
          <Link
            href="#accessories"
            className="px-4 py-2 text-sm font-medium transition-all rounded-full bg-foreground text-background hover:opacity-80"
          >
            구성안
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="transition-colors md:hidden text-foreground"
          aria-label={isMenuOpen ? "메뉴 닫기" : "메뉴 열기"}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="border-t border-border bg-background px-6 py-8 md:hidden rounded-b-2xl">
          <nav className="flex flex-col gap-6">
            <Link
              href="#form"
              className="text-lg text-foreground"
              onClick={() => setIsMenuOpen(false)}
            >
              형태
            </Link>
            <Link
              href="#hardware"
              className="text-lg text-foreground"
              onClick={() => setIsMenuOpen(false)}
            >
              하드웨어
            </Link>
            <Link
              href="#gallery"
              className="text-lg text-foreground"
              onClick={() => setIsMenuOpen(false)}
            >
              렌더
            </Link>
            <Link
              href="#system"
              className="text-lg text-foreground"
              onClick={() => setIsMenuOpen(false)}
            >
              시스템
            </Link>
            <Link
              href="#accessories"
              className="mt-4 bg-foreground px-5 py-3 text-center text-sm font-medium text-background rounded-full"
              onClick={() => setIsMenuOpen(false)}
            >
              구성안
            </Link>
          </nav>
        </div>
      )}
      </header>
    </>
  );
}

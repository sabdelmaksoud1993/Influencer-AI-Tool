"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

export default function LandingPage() {
  const [loaded, setLoaded] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [scrollY, setScrollY] = useState(0);
  const [activeVenue, setActiveVenue] = useState(0);
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactForm, setContactForm] = useState({ name: "", venueName: "", email: "", phone: "", message: "" });
  const [contactStatus, setContactStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setLoaded(true);
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveVenue((prev) => (prev + 1) % venueTypes.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    const x = (e.clientX / window.innerWidth) * 100;
    const y = (e.clientY / window.innerHeight) * 100;
    setMousePos({ x, y });
  };

  const venueTypes = [
    { category: "Nightclubs", icon: "🎵", desc: "High-energy clubs & DJ venues" },
    { category: "Rooftops", icon: "🌆", desc: "Skyline views & sunset lounges" },
    { category: "Beach Clubs", icon: "🏖", desc: "Beachfront day-to-night spots" },
    { category: "Fine Dining", icon: "🍽", desc: "Luxury restaurants & chef tables" },
    { category: "Lounges", icon: "🥂", desc: "Upscale cocktail & shisha lounges" },
    { category: "Pop-Ups", icon: "✨", desc: "Exclusive events & brand activations" },
  ];

  const navOpacity = Math.min(scrollY / 200, 1);

  return (
    <div className="relative overflow-hidden" onMouseMove={handleMouseMove}>
      {/* Ambient glow following cursor */}
      <div
        className="fixed inset-0 pointer-events-none z-10 transition-all duration-700"
        style={{
          background: `radial-gradient(600px circle at ${mousePos.x}% ${mousePos.y}%, rgba(233, 30, 140, 0.04), transparent 60%)`,
        }}
      />

      {/* ═══════════════════════════════════════════ */}
      {/* NAVIGATION                                  */}
      {/* ═══════════════════════════════════════════ */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        style={{
          backgroundColor: `rgba(13, 11, 26, ${navOpacity * 0.95})`,
          backdropFilter: navOpacity > 0.1 ? "blur(20px)" : "none",
          borderBottom: navOpacity > 0.5 ? "1px solid var(--border)" : "1px solid transparent",
        }}
      >
        <div className={`max-w-6xl mx-auto flex items-center justify-between px-8 transition-all duration-500 ${navOpacity > 0.5 ? "py-4" : "py-6"}`}>
          <div className="flex items-center gap-3">
            {/* Glow Pass logo - two circles */}
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded-full bg-[var(--purple)]" />
              <div className="w-3 h-3 rounded-full bg-[var(--pink)]" />
            </div>
            <span
              className={`tracking-[0.2em] text-white uppercase font-extrabold transition-all duration-500 ${navOpacity > 0.5 ? "text-[0.7rem]" : "text-xs"}`}
            >
              GLOW PASS
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {[
              { label: "About", href: "#about" },
              { label: "Venues", href: "#venues" },
              { label: "How It Works", href: "#how-it-works" },
              { label: "For Venues", href: "#for-venues" },
            ].map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-[0.6rem] tracking-[0.15em] text-[var(--text-muted)] uppercase font-semibold hover:text-[var(--pink)] transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-[0.6rem] tracking-[0.12em] text-[var(--text-muted)] uppercase font-semibold hover:text-[var(--pink)] transition-colors hidden sm:block"
            >
              Login
            </Link>
            <Link href="/apply" className="btn-gold btn-sm !py-2 !px-5">
              Join
            </Link>
          </div>
        </div>
      </nav>

      {/* ═══════════════════════════════════════════ */}
      {/* HERO SECTION                                */}
      {/* ═══════════════════════════════════════════ */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
      >
        {/* Hero background with purple blobs */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[var(--bg-primary)]" />
          {/* Large purple circle - top right */}
          <div
            className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full opacity-40"
            style={{
              background: "radial-gradient(circle, rgba(107, 47, 160, 0.6) 0%, rgba(107, 47, 160, 0) 70%)",
              transform: `translateY(${scrollY * 0.15}px)`,
            }}
          />
          {/* Large purple circle - bottom left */}
          <div
            className="absolute -bottom-48 -left-32 w-[500px] h-[500px] rounded-full opacity-30"
            style={{
              background: "radial-gradient(circle, rgba(107, 47, 160, 0.5) 0%, rgba(107, 47, 160, 0) 70%)",
              transform: `translateY(${scrollY * -0.1}px)`,
            }}
          />
          {/* Pink accent glow */}
          <div
            className="absolute top-1/3 left-1/4 w-[300px] h-[300px] rounded-full opacity-10"
            style={{
              background: "radial-gradient(circle, rgba(233, 30, 140, 0.6) 0%, transparent 70%)",
            }}
          />
        </div>

        {/* Vertical accent line */}
        <div className="absolute top-20 left-[8%] w-[2px] h-[60%] bg-gradient-to-b from-[var(--pink)] via-[var(--pink)] to-transparent opacity-30" />

        {/* Hero Content */}
        <div className="relative z-10 max-w-3xl px-6" style={{ paddingLeft: "12%" }}>
          <h1
            className={`text-7xl md:text-[8rem] font-black leading-[0.9] mb-2 tracking-tight transition-all duration-1000 delay-300 ${loaded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"}`}
          >
            <span className="text-white block">GLOW</span>
            <span className="glow-text block">PASS</span>
          </h1>

          <p
            className={`text-[var(--text-secondary)] text-base md:text-lg font-light leading-relaxed mb-2 max-w-md transition-all duration-1000 delay-600 ${loaded ? "opacity-100" : "opacity-0"}`}
          >
            The premium creator network for nightlife venues.
          </p>
          <p
            className={`text-[var(--text-muted)] text-sm italic mb-10 transition-all duration-1000 delay-700 ${loaded ? "opacity-100" : "opacity-0"}`}
          >
            Access the city. Capture the glow.
          </p>

          {/* CTAs */}
          <div
            className={`flex flex-col sm:flex-row items-start gap-4 mb-8 transition-all duration-1000 delay-900 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          >
            <Link href="/apply" className="btn-gold !px-10 !py-4 !text-[0.75rem]">
              Apply for Membership
            </Link>
            <Link href="/apply?role=venue" className="btn-outline !px-10 !py-4 !text-[0.75rem]">
              Partner Your Venue
            </Link>
          </div>

          <div
            className={`flex items-center gap-5 transition-all duration-1000 delay-1100 ${loaded ? "opacity-100" : "opacity-0"}`}
          >
            <Link href="/login" className="text-[0.6rem] tracking-[0.12em] text-[var(--text-muted)] uppercase font-semibold hover:text-[var(--pink)] transition-colors">
              Creator Login
            </Link>
            <span className="text-[var(--border)] text-xs">&middot;</span>
            <Link href="/login" className="text-[0.6rem] tracking-[0.12em] text-[var(--text-muted)] uppercase font-semibold hover:text-[var(--pink)] transition-colors">
              Venue Login
            </Link>
          </div>
        </div>

        {/* Bottom logo accent */}
        <div
          className={`absolute bottom-8 right-8 flex items-end gap-1.5 transition-all duration-1000 delay-1200 ${loaded ? "opacity-100" : "opacity-0"}`}
        >
          <div className="w-6 h-6 rounded-full bg-[var(--purple)] opacity-60" />
          <div className="w-4 h-4 rounded-full bg-[var(--pink)] opacity-80" />
        </div>

        {/* Powered by */}
        <div
          className={`absolute bottom-8 left-[8%] transition-all duration-1000 delay-1300 ${loaded ? "opacity-100" : "opacity-0"}`}
        >
          <p className="text-[0.5rem] tracking-[0.3em] text-[var(--text-muted)] uppercase font-semibold">
            Powered by Ticketezzy
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════ */}
      {/* STATS BAR                                   */}
      {/* ═══════════════════════════════════════════ */}
      <section className="relative z-10 py-14 border-y border-[var(--border)] bg-[var(--bg-secondary)]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "68%", label: "of venues struggle to fill capacity" },
              { value: "3x", label: "paid ads cost vs organic content" },
              { value: "74%", label: "guests choose venues via social" },
              { value: "#1", label: "social proof drives premium perception" },
            ].map((stat, i) => (
              <div key={i}>
                <div className="text-3xl md:text-4xl font-black text-[var(--pink)] mb-2">
                  {stat.value}
                </div>
                <div className="text-[0.55rem] tracking-[0.15em] text-[var(--text-muted)] uppercase font-semibold">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════ */}
      {/* ABOUT / WHAT IS GLOW PASS                   */}
      {/* ═══════════════════════════════════════════ */}
      <section id="about" className="relative z-10 py-24 px-6 hero-bg overflow-hidden">
        {/* Decorative purple blob */}
        <div className="absolute -left-48 top-0 w-[400px] h-[400px] rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, rgba(107, 47, 160, 0.6) 0%, transparent 70%)" }}
        />

        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            {/* Left - Text */}
            <div>
              <p className="text-[0.6rem] tracking-[0.3em] text-[var(--pink)] uppercase mb-4 font-bold">
                The Solution
              </p>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
                Meet<br />
                <span className="glow-text">Glow Pass.</span>
              </h2>
              <div className="w-12 h-[3px] bg-gradient-to-r from-[var(--pink)] to-[var(--purple)] mb-6 rounded" />
              <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-4">
                A curated network of vetted social creators who visit your venue in exchange
                for premium experiences. They create Instagram stories, posts, and reels that
                showcase your venue.
              </p>
              <p className="text-[var(--text-muted)] text-sm leading-relaxed mb-8">
                Organic content that fills tables, elevates atmosphere, and builds your reputation.
                No agency fees. No awkward campaigns. Just real people, real content, real results.
              </p>
              <Link href="/apply" className="btn-gold">
                Apply Now
              </Link>
            </div>

            {/* Right - Feature grid */}
            <div className="grid grid-cols-2 gap-4">
              {[
                {
                  icon: (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[var(--pink)]">
                      <path d="M12 2L2 7l10 5 10-5-10-5z" />
                      <path d="M2 17l10 5 10-5" />
                      <path d="M2 12l10 5 10-5" />
                    </svg>
                  ),
                  title: "VIP Access",
                  desc: "Free entry & reserved tables at top venues",
                },
                {
                  icon: (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[var(--pink)]">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                  ),
                  title: "Complimentary",
                  desc: "Drinks, dining, and luxury experiences included",
                },
                {
                  icon: (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[var(--purple-light)]">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  ),
                  title: "Creator Tiers",
                  desc: "Rise from Creator to Inner Circle to Muse",
                },
                {
                  icon: (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[var(--purple-light)]">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  ),
                  title: "Community",
                  desc: "Connect with creators who match your energy",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="glass-card-gold p-6 hover:border-[var(--pink)] transition-all duration-300 group rounded-lg"
                >
                  <div className="mb-4 group-hover:scale-110 transition-transform">{item.icon}</div>
                  <h4 className="text-xs tracking-[0.1em] text-white uppercase mb-2 font-bold">
                    {item.title}
                  </h4>
                  <p className="text-[var(--text-muted)] text-[0.7rem] leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════ */}
      {/* VENUE CATEGORIES                             */}
      {/* ═══════════════════════════════════════════ */}
      <section id="venues" className="relative z-10 py-24 px-6 bg-[var(--bg-primary)]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[0.6rem] tracking-[0.3em] text-[var(--pink)] uppercase mb-4 font-bold">
              Venue Categories
            </p>
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
              Every Venue Type. One Platform.
            </h2>
            <div className="w-12 h-[3px] bg-gradient-to-r from-[var(--pink)] to-[var(--purple)] mx-auto mb-4 rounded" />
            <p className="text-[var(--text-muted)] text-sm max-w-lg mx-auto">
              From high-energy nightclubs to rooftop lounges — we match the right creators
              to your venue&apos;s vibe. New partners onboarding every week.
            </p>
          </div>

          {/* Category grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
            {venueTypes.map((item, i) => (
              <div
                key={i}
                className={`relative overflow-hidden border transition-all duration-500 cursor-pointer group rounded-lg ${
                  activeVenue === i
                    ? "border-[var(--pink)] gold-glow"
                    : "border-[var(--border)] hover:border-[var(--border-pink)]"
                }`}
                onClick={() => setActiveVenue(i)}
              >
                <div
                  className={`absolute inset-0 transition-opacity duration-500 ${
                    activeVenue === i ? "opacity-100" : "opacity-0"
                  }`}
                  style={{
                    background: "linear-gradient(135deg, rgba(233, 30, 140, 0.1), rgba(13, 11, 26, 0.95))",
                  }}
                />
                <div className="relative p-6">
                  <div className="text-2xl mb-3">{item.icon}</div>
                  <h3
                    className={`text-lg md:text-xl font-bold mb-1 transition-colors ${
                      activeVenue === i ? "text-white" : "text-[var(--text-secondary)]"
                    }`}
                  >
                    {item.category}
                  </h3>
                  <p className="text-[var(--text-muted)] text-xs">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link href="/apply" className="btn-outline">
              Apply for Access
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════ */}
      {/* HOW IT WORKS                                */}
      {/* ═══════════════════════════════════════════ */}
      <section id="how-it-works" className="relative z-10 py-24 px-6 bg-[var(--bg-secondary)]">
        {/* Decorative purple blob */}
        <div className="absolute -right-32 top-0 w-[300px] h-[300px] rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, rgba(107, 47, 160, 0.8) 0%, transparent 70%)" }}
        />

        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[0.6rem] tracking-[0.3em] text-[var(--pink)] uppercase mb-4 font-bold">
              How It Works
            </p>
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
              Four Steps. Zero Friction.
            </h2>
            <div className="w-12 h-[3px] bg-gradient-to-r from-[var(--pink)] to-[var(--purple)] mx-auto rounded" />
          </div>

          <div className="grid md:grid-cols-4 gap-4">
            {[
              {
                step: "01",
                title: "Venue Joins",
                desc: "Register your venue, set available nights and experience types.",
              },
              {
                step: "02",
                title: "We Match",
                desc: "We curate the right creators for your venue's style and audience.",
              },
              {
                step: "03",
                title: "Creators Arrive",
                desc: "They enjoy the experience and capture premium content live.",
              },
              {
                step: "04",
                title: "Content Goes Live",
                desc: "Stories, posts & tags reach thousands of engaged followers.",
              },
            ].map((item, i) => (
              <div key={i} className="relative p-6 border border-[var(--border)] rounded-lg bg-[var(--bg-card)] hover:border-[var(--border-pink)] transition-all duration-300">
                {/* Pink top border accent */}
                <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-lg"
                  style={{
                    background: `linear-gradient(90deg, ${
                      i === 0 ? 'var(--pink)' :
                      i === 1 ? 'var(--pink-dark)' :
                      i === 2 ? 'var(--purple)' :
                      'var(--purple-light)'
                    }, transparent)`,
                  }}
                />
                <div className="text-3xl font-black text-[var(--pink)] mb-3 opacity-60">
                  {item.step}
                </div>
                <h3 className="text-xs tracking-[0.12em] text-white uppercase mb-3 font-bold">
                  {item.title}
                </h3>
                <p className="text-[var(--text-muted)] text-xs leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════ */}
      {/* CREATOR NETWORK                             */}
      {/* ═══════════════════════════════════════════ */}
      <section className="relative z-10 py-24 px-6 hero-bg">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-start">
            <div>
              <p className="text-[0.6rem] tracking-[0.3em] text-[var(--pink)] uppercase mb-4 font-bold">
                The Creator Network
              </p>
              <h2 className="text-3xl md:text-4xl font-black text-white mb-6 leading-tight">
                Who Are<br />
                <span className="glow-text">Our Creators?</span>
              </h2>
              <div className="w-12 h-[3px] bg-gradient-to-r from-[var(--pink)] to-[var(--purple)] mb-6 rounded" />
              <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
                Carefully vetted social creators with aesthetic profiles, engaged audiences,
                and content expertise. Every creator is screened for style, professionalism, and reach.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { symbol: "★", title: "Aesthetic Profiles", desc: "Carefully curated visual styles matched to luxury venues" },
                { symbol: "◆", title: "Micro-Influencers", desc: "5K-150K followers with high engagement and loyal audiences" },
                { symbol: "▲", title: "Content Native", desc: "Expert storytellers: Stories, Reels, cinematic photography" },
                { symbol: "●", title: "Vetted & Reliable", desc: "Every creator screened for style, professionalism & reach" },
              ].map((item, i) => (
                <div
                  key={i}
                  className="glass-card-gold p-5 hover:border-[var(--pink)] transition-all duration-300 rounded-lg"
                >
                  <span className="text-[var(--pink)] text-lg mb-3 block">{item.symbol}</span>
                  <h4 className="text-xs tracking-[0.08em] text-white uppercase mb-2 font-bold">
                    {item.title}
                  </h4>
                  <p className="text-[var(--text-muted)] text-[0.7rem] leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════ */}
      {/* CONTENT OUTPUT                              */}
      {/* ═══════════════════════════════════════════ */}
      <section className="relative z-10 py-24 px-6 bg-[var(--bg-secondary)] border-t border-[var(--border)]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[0.6rem] tracking-[0.3em] text-[var(--pink)] uppercase mb-4 font-bold">
              Content Output
            </p>
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
              The Content Your Venue Earns
            </h2>
            <div className="w-12 h-[3px] bg-gradient-to-r from-[var(--pink)] to-[var(--purple)] mx-auto rounded" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { type: "STORY", format: "9:16 · Vertical", reach: "1,200+", desc: "Venue tag + location with swipe-up link" },
              { type: "REEL", format: "15-30s · Video", reach: "4,800+", desc: "Ambience & highlight showcase of the night" },
              { type: "POST", format: "1:1 · Grid", reach: "2,100+", desc: "Curated photography with venue mention" },
              { type: "COLLAB", format: "Multi-creator", reach: "12,000+", desc: "Group content drops for maximum exposure" },
            ].map((item, i) => (
              <div key={i} className="border border-[var(--border)] rounded-lg p-6 bg-[var(--bg-card)] hover:border-[var(--border-pink)] transition-all duration-300 text-center">
                <h4 className="text-xs tracking-[0.15em] text-white uppercase mb-1 font-bold">{item.type}</h4>
                <p className="text-[0.55rem] text-[var(--text-muted)] mb-4">{item.format}</p>
                <div className="text-2xl font-black text-[var(--pink)] mb-1">{item.reach}</div>
                <p className="text-[0.55rem] text-[var(--text-muted)] uppercase tracking-wider mb-4 font-semibold">avg reach</p>
                <p className="text-[var(--text-secondary)] text-[0.7rem] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════ */}
      {/* FOR VENUES - B2B Section                    */}
      {/* ═══════════════════════════════════════════ */}
      <section id="for-venues" className="relative z-10 py-24 px-6 bg-[var(--bg-primary)]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[0.6rem] tracking-[0.3em] text-[var(--pink)] uppercase mb-4 font-bold">
              Value for Venues
            </p>
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
              What Your Venue Gains
            </h2>
            <div className="w-12 h-[3px] bg-gradient-to-r from-[var(--pink)] to-[var(--purple)] mx-auto mb-4 rounded" />
            <p className="text-[var(--text-muted)] text-sm max-w-2xl mx-auto">
              We deliver what promoters promise but rarely execute — a curated creator crowd
              that elevates atmosphere and creates organic social media exposure.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {[
              {
                value: "25-40",
                label: "Curated creators per event",
                desc: "Well-dressed, high-energy, arriving by your specified time. Guaranteed.",
              },
              {
                value: "50-80+",
                label: "Instagram stories per night",
                desc: "Organic content tagging your venue. Worth $3-5K in equivalent ad spend.",
              },
              {
                value: "100%",
                label: "Tracked & reported",
                desc: "Real-time RSVPs, attendance tracking, and content performance data.",
              },
            ].map((item, i) => (
              <div key={i} className="glass-card p-8 text-center hover:border-[var(--border-pink)] transition-all duration-300 rounded-lg">
                <div className="text-4xl font-black text-[var(--pink)] mb-3">
                  {item.value}
                </div>
                <h4 className="text-xs tracking-[0.1em] text-white uppercase mb-3 font-bold">
                  {item.label}
                </h4>
                <p className="text-[var(--text-muted)] text-xs leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link href="/apply?role=venue" className="btn-gold !px-10">
              Partner With Glow Pass
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════ */}
      {/* PACKAGES                                    */}
      {/* ═══════════════════════════════════════════ */}
      <section className="relative z-10 py-24 px-6 bg-[var(--bg-secondary)] border-t border-[var(--border)]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[0.6rem] tracking-[0.3em] text-[var(--pink)] uppercase mb-4 font-bold">
              Tailored Packages
            </p>
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
              Built Around Your Venue.
            </h2>
            <div className="w-12 h-[3px] bg-gradient-to-r from-[var(--pink)] to-[var(--purple)] mx-auto mb-6 rounded" />
            <p className="text-[var(--text-secondary)] text-sm leading-relaxed max-w-xl mx-auto mb-2">
              Every venue is different. We create custom creator packages based on your capacity,
              location, vibe, and goals — so you only pay for what moves the needle.
            </p>
            <p className="text-[var(--text-muted)] text-xs leading-relaxed max-w-md mx-auto">
              Whether you need 10 creators on a Tuesday or 50 for a launch night,
              we&apos;ll build the perfect plan. No long-term contracts. Cancel anytime.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-12">
            {[
              { icon: "🎯", title: "Custom Creator Count", desc: "Choose how many creators per event based on your capacity" },
              { icon: "📊", title: "Performance Dashboard", desc: "Real-time analytics on attendance, content, and reach" },
              { icon: "🤝", title: "Dedicated Account Manager", desc: "A single point of contact who knows your brand" },
            ].map((item, i) => (
              <div key={i} className="border border-[var(--border)] rounded-lg p-6 bg-[var(--bg-card)] hover:border-[var(--border-pink)] transition-all duration-300">
                <div className="text-2xl mb-3">{item.icon}</div>
                <h4 className="text-xs tracking-[0.1em] text-white uppercase mb-2 font-bold">{item.title}</h4>
                <p className="text-[var(--text-muted)] text-[0.7rem] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center">
            {!showContactForm ? (
              <>
                <button
                  onClick={() => setShowContactForm(true)}
                  className="btn-gold !px-12 !py-4 !text-[0.75rem]"
                >
                  Contact Sales
                </button>
                <p className="text-[var(--text-muted)] text-[0.6rem] mt-4 tracking-wider">
                  We respond within 24 hours
                </p>
              </>
            ) : (
              <div className="max-w-md mx-auto text-left animate-fade-in-up">
                {contactStatus === "sent" ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">✅</div>
                    <h3 className="text-white text-lg font-bold mb-2">Message Sent!</h3>
                    <p className="text-[var(--text-muted)] text-sm">We&apos;ll get back to you within 24 hours.</p>
                  </div>
                ) : (
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      setContactStatus("sending");
                      try {
                        const res = await fetch("/api/contact", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify(contactForm),
                        });
                        if (res.ok) {
                          setContactStatus("sent");
                        } else {
                          setContactStatus("error");
                        }
                      } catch {
                        setContactStatus("error");
                      }
                    }}
                    className="space-y-3"
                  >
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Your Name"
                        required
                        className="input-field"
                        value={contactForm.name}
                        onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      />
                      <input
                        type="text"
                        placeholder="Venue Name"
                        required
                        className="input-field"
                        value={contactForm.venueName}
                        onChange={(e) => setContactForm({ ...contactForm, venueName: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="email"
                        placeholder="Email"
                        required
                        className="input-field"
                        value={contactForm.email}
                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      />
                      <input
                        type="tel"
                        placeholder="Phone"
                        className="input-field"
                        value={contactForm.phone}
                        onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                      />
                    </div>
                    <textarea
                      placeholder="Tell us about your venue and what you're looking for..."
                      required
                      rows={3}
                      className="input-field w-full resize-none"
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    />
                    {contactStatus === "error" && (
                      <p className="text-red-400 text-xs">Something went wrong. Please try again.</p>
                    )}
                    <div className="flex gap-3">
                      <button
                        type="submit"
                        disabled={contactStatus === "sending"}
                        className="btn-gold !px-8 !py-3 !text-[0.7rem] flex-1"
                      >
                        {contactStatus === "sending" ? "Sending..." : "Send Message"}
                      </button>
                      <button
                        type="button"
                        onClick={() => { setShowContactForm(false); setContactStatus("idle"); }}
                        className="btn-outline !px-6 !py-3 !text-[0.7rem]"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════ */}
      {/* FINAL CTA                                   */}
      {/* ═══════════════════════════════════════════ */}
      <section className="relative z-10 py-28 px-6 overflow-hidden">
        {/* Background purple blobs */}
        <div className="absolute inset-0 bg-[var(--bg-primary)]" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, rgba(107, 47, 160, 0.6) 0%, transparent 70%)" }}
        />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, rgba(233, 30, 140, 0.5) 0%, transparent 70%)" }}
        />

        <div className="relative max-w-2xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-10">
            <div className="w-8 h-8 rounded-full bg-[var(--purple)] opacity-60" />
            <div className="w-6 h-6 rounded-full bg-[var(--pink)] opacity-80" />
          </div>

          <h2 className="text-3xl md:text-5xl font-black text-white mb-6 leading-tight">
            GLOW<br />
            <span className="glow-text">DIFFERENT.</span>
          </h2>

          <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-10 max-w-md mx-auto">
            Let&apos;s build the future of nightlife marketing — together.
            Applications reviewed within 48 hours.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <Link href="/apply" className="btn-gold !px-12 !py-4">
              Apply Now
            </Link>
            <a href="#for-venues" onClick={() => setShowContactForm(true)} className="btn-outline !px-12 !py-4">
              Contact Sales
            </a>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════ */}
      {/* FOOTER                                      */}
      {/* ═══════════════════════════════════════════ */}
      <footer className="relative z-10 bg-[var(--bg-secondary)] border-t border-[var(--border)]">
        <div className="max-w-5xl mx-auto px-8 py-16">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-[var(--purple)]" />
                  <div className="w-2 h-2 rounded-full bg-[var(--pink)]" />
                </div>
                <span className="text-xs tracking-[0.15em] text-white uppercase font-extrabold">
                  Glow Pass
                </span>
              </div>
              <p className="text-[var(--text-muted)] text-xs leading-relaxed">
                The premium creator network for nightlife venues.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-[0.6rem] tracking-[0.15em] text-[var(--text-secondary)] uppercase mb-4 font-bold">
                Quick Links
              </h4>
              <div className="space-y-2">
                {[
                  { label: "Apply as Creator", href: "/apply" },
                  { label: "Register Venue", href: "/apply?role=venue" },
                  { label: "Creator Login", href: "/member" },
                  { label: "Venue Login", href: "/venue" },
                ].map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="block text-xs text-[var(--text-muted)] hover:text-[var(--pink)] transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-[0.6rem] tracking-[0.15em] text-[var(--text-secondary)] uppercase mb-4 font-bold">
                Contact
              </h4>
              <div className="space-y-2">
                <p className="text-xs text-[var(--text-muted)]">hello@myglowpass.com</p>
                <p className="text-xs text-[var(--text-muted)]">Dubai, UAE</p>
              </div>
            </div>

            {/* Social */}
            <div>
              <h4 className="text-[0.6rem] tracking-[0.15em] text-[var(--text-secondary)] uppercase mb-4 font-bold">
                Follow
              </h4>
              <div className="space-y-2">
                <a href="https://instagram.com/myglowpass" target="_blank" rel="noopener noreferrer" className="block text-xs text-[var(--text-muted)] hover:text-[var(--pink)] transition-colors">Instagram: @myglowpass</a>
                <a href="https://tiktok.com/@myglowpass" target="_blank" rel="noopener noreferrer" className="block text-xs text-[var(--text-muted)] hover:text-[var(--pink)] transition-colors">TikTok: @myglowpass</a>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="pt-8 border-t border-[var(--border)] flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-[0.55rem] text-[var(--text-muted)] tracking-wider font-semibold">
              &copy; 2026 Glow Pass. Powered by <a href="https://www.ticketezzy.com" target="_blank" rel="noopener noreferrer" className="text-[var(--pink)] hover:underline">Ticketezzy</a>. All rights reserved.
            </p>
            <p className="text-[0.55rem] text-[var(--text-muted)] tracking-wider italic">
              &ldquo;Access the city. Capture the glow.&rdquo;
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

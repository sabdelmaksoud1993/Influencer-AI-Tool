"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

interface VenueData {
  id: string;
  name: string;
  location: string;
  contactName: string;
  contactEmail: string;
  instagram: string;
  venueType: string;
  capacity: number;
  accessCode: string;
  status: string;
  totalEvents: number;
  totalMembersSent: number;
  createdAt: string;
}

interface ContentProof {
  link: string;
  type: string;
  submittedAt: string;
  verified?: boolean;
  verifiedAt?: string;
  verifiedBy?: string;
}

interface RsvpData {
  memberId: string;
  memberName: string;
  instagram?: string;
  followerCount?: number;
  status: string;
  contentPosted?: boolean;
  rsvpAt: string;
  checkedInAt?: string;
  contentProofs?: ContentProof[];
  contentStatus?: string;
  qrToken?: string;
}

interface VenueEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  status: string;
  capacity: number;
  confirmed: number;
  attended: number;
  contentPosted: number;
  rsvps: RsvpData[];
}

interface VenueStats {
  totalEvents: number;
  totalConfirmed: number;
  totalAttended: number;
  totalContent: number;
}

interface EventTemplate {
  id: string;
  title: string;
  time: string;
  arrivalDeadline?: string;
  dressCode?: string;
  description?: string;
  capacity?: number;
  perks?: string[];
}

interface CreatorProfile {
  id: string;
  name: string;
  instagram?: string;
  followerCount?: number;
  reliabilityScore?: number;
  attendanceRate?: number;
  noShows?: number;
  strikes?: number;
  tier?: string;
  eventHistory?: { eventTitle: string; date: string; status: string }[];
}

export default function VenuePage() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [venue, setVenue] = useState<VenueData | null>(null);
  const [events, setEvents] = useState<VenueEvent[]>([]);
  const [stats, setStats] = useState<VenueStats | null>(null);
  const [pending, setPending] = useState(false);
  const [tab, setTab] = useState<"overview" | "events">("overview");

  // Create Event modal
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [creating, setCreating] = useState(false);
  const [eventForm, setEventForm] = useState({
    title: "",
    date: "",
    time: "",
    arrivalDeadline: "",
    dressCode: "",
    description: "",
    capacity: "30",
    perks: "",
  });
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);

  // Review state
  const [reviewingId, setReviewingId] = useState<string | null>(null);

  // Templates
  const [templates, setTemplates] = useState<EventTemplate[]>([]);

  // QR Check-In
  const [qrToken, setQrToken] = useState("");
  const [qrMessage, setQrMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [scanResult, setScanResult] = useState("");

  // Creator Profile Preview
  const [creatorProfile, setCreatorProfile] = useState<CreatorProfile | null>(null);
  const [showCreatorProfile, setShowCreatorProfile] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);

  // Success message
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (status === "authenticated" && (session?.user as any)?.accessCode) {
      fetchVenueData((session.user as any).accessCode);
    }
  }, [status, session]);

  const fetchVenueData = async (accessCode: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/venues/${accessCode}`);
      if (!res.ok) throw new Error("Failed to load venue data");
      const data = await res.json();
      setVenue(data.venue);
      setEvents(data.events || []);
      setStats(data.stats || null);
      setPending(data.pending || false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const refreshVenueData = useCallback(async () => {
    if (!venue) return;
    try {
      const res = await fetch(`/api/venues/${venue.accessCode}`);
      if (res.ok) {
        const data = await res.json();
        setEvents(data.events || []);
        setStats(data.stats || null);
      }
    } catch { /* silent */ }
  }, [venue]);

  const fetchTemplates = useCallback(async () => {
    if (!venue) return;
    try {
      const res = await fetch("/api/events/templates", {
        headers: { "x-venue-code": venue.accessCode },
      });
      if (res.ok) {
        const data = await res.json();
        setTemplates(data.templates || []);
      }
    } catch { /* silent */ }
  }, [venue]);

  useEffect(() => {
    if (venue && !pending) {
      fetchTemplates();
    }
  }, [venue, pending, fetchTemplates]);

  // QR Camera Scanner
  useEffect(() => {
    if (!showScanner) return;

    let scanner: any = null;

    const initScanner = async () => {
      const { Html5Qrcode } = await import('html5-qrcode');
      scanner = new Html5Qrcode("qr-reader");

      try {
        await scanner.start(
          { facingMode: "environment" },
          { fps: 15, qrbox: { width: 200, height: 200 }, aspectRatio: 1.0 },
          async (decodedText: string) => {
            // Stop scanner
            await scanner.stop();
            setShowScanner(false);

            // Check in with the scanned token
            try {
              const res = await fetch("/api/events/checkin-qr", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token: decodedText }),
              });
              const data = await res.json();
              if (res.ok) {
                setScanResult(`✅ ${data.member} checked in to ${data.event}`);
              } else {
                setScanResult(`❌ ${data.error}`);
              }
            } catch {
              setScanResult("❌ Failed to check in");
            }
            await refreshVenueData();
          },
          () => {} // ignore errors during scanning
        );
      } catch (err) {
        setScanResult("❌ Camera access denied or not available");
        setShowScanner(false);
      }
    };

    initScanner();

    return () => {
      if (scanner) {
        scanner.stop().catch(() => {});
      }
    };
  }, [showScanner, refreshVenueData]);

  const handleCreateEvent = async () => {
    if (!venue || !eventForm.title || !eventForm.date || !eventForm.time) {
      setError("Please fill in the event title, date, and time.");
      return;
    }
    setCreating(true);
    setError("");

    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-venue-code": venue.accessCode,
        },
        body: JSON.stringify({
          title: eventForm.title,
          date: eventForm.date,
          time: eventForm.time,
          arrivalDeadline: eventForm.arrivalDeadline,
          dressCode: eventForm.dressCode,
          description: eventForm.description,
          capacity: eventForm.capacity,
          perks: eventForm.perks.split(",").map((p) => p.trim()).filter(Boolean),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create event");
      }

      // Save as template if checked
      if (saveAsTemplate) {
        try {
          await fetch("/api/events/templates", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-venue-code": venue.accessCode,
            },
            body: JSON.stringify({
              title: eventForm.title,
              time: eventForm.time,
              arrivalDeadline: eventForm.arrivalDeadline,
              dressCode: eventForm.dressCode,
              description: eventForm.description,
              capacity: eventForm.capacity,
              perks: eventForm.perks,
            }),
          });
          await fetchTemplates();
        } catch { /* silent template save failure */ }
      }

      setEventForm({ title: "", date: "", time: "", arrivalDeadline: "", dressCode: "", description: "", capacity: "30", perks: "" });
      setSaveAsTemplate(false);
      setShowCreateEvent(false);
      await refreshVenueData();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create event");
    } finally {
      setCreating(false);
    }
  };

  const handleUseTemplate = (template: EventTemplate) => {
    setEventForm({
      title: template.title,
      date: "",
      time: template.time,
      arrivalDeadline: template.arrivalDeadline || "",
      dressCode: template.dressCode || "",
      description: template.description || "",
      capacity: template.capacity ? String(template.capacity) : "30",
      perks: template.perks ? template.perks.join(", ") : "",
    });
    setSaveAsTemplate(false);
    setShowCreateEvent(true);
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!venue) return;
    if (!confirm("Delete this template?")) return;
    try {
      await fetch("/api/events/templates", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-venue-code": venue.accessCode,
        },
        body: JSON.stringify({ id }),
      });
      await fetchTemplates();
    } catch { /* silent */ }
  };

  const handleQrCheckin = async () => {
    if (!qrToken.trim()) return;
    setQrMessage(null);
    try {
      const res = await fetch("/api/events/checkin-qr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: qrToken.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setQrMessage({ type: "error", text: data.error || "Check-in failed" });
      } else {
        setQrMessage({ type: "success", text: data.message || "Creator checked in successfully!" });
        setQrToken("");
        await refreshVenueData();
      }
    } catch {
      setQrMessage({ type: "error", text: "Check-in failed. Please try again." });
    }
  };

  const handleBlockCreator = async (creatorAccessCode: string) => {
    if (!venue) return;
    if (!confirm("Are you sure you want to block this creator? They will not be able to apply to your events.")) return;
    try {
      const res = await fetch(`/api/members/${creatorAccessCode}/block`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-venue-code": venue.accessCode,
        },
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to block creator");
      }
      setSuccessMsg("Creator blocked successfully.");
      setTimeout(() => setSuccessMsg(""), 3000);
      await refreshVenueData();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to block creator");
    }
  };

  const handleCompleteEvent = async (eventId: string) => {
    if (!venue) return;
    if (!confirm("Mark this event as completed? This action cannot be undone.")) return;
    try {
      const res = await fetch(`/api/events/${eventId}/complete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-venue-code": venue.accessCode,
        },
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to complete event");
      }
      setSuccessMsg("Event marked as completed.");
      setTimeout(() => setSuccessMsg(""), 3000);
      await refreshVenueData();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to complete event");
    }
  };

  const handleViewCreatorProfile = async (memberId: string) => {
    if (!venue) return;
    setLoadingProfile(true);
    setShowCreatorProfile(true);
    setCreatorProfile(null);
    try {
      const res = await fetch(`/api/creators/${memberId}`, {
        headers: { "x-venue-code": venue.accessCode },
      });
      if (res.ok) {
        const data = await res.json();
        setCreatorProfile(data);
      } else {
        setCreatorProfile(null);
      }
    } catch {
      setCreatorProfile(null);
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleReviewCreator = async (eventId: string, memberId: string, decision: "confirmed" | "declined") => {
    if (!venue) return;
    setReviewingId(memberId);

    try {
      const res = await fetch(`/api/events/${eventId}/rsvp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-venue-code": venue.accessCode,
        },
        body: JSON.stringify({
          accessCode: venue.accessCode,
          memberId,
          status: decision,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to review");
      }

      await refreshVenueData();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to review creator");
    } finally {
      setReviewingId(null);
    }
  };

  const handleCheckin = async (eventId: string, memberId: string, action: "checkin" | "no_show") => {
    if (!venue) return;
    setReviewingId(memberId);

    try {
      const res = await fetch(`/api/events/${eventId}/checkin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-venue-code": venue.accessCode,
        },
        body: JSON.stringify({ memberId, action }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to check in");
      }

      await refreshVenueData();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update check-in status");
    } finally {
      setReviewingId(null);
    }
  };

  const handleVerifyContent = async (eventId: string, memberId: string) => {
    if (!venue) return;
    setReviewingId(memberId);

    try {
      const res = await fetch(`/api/events/${eventId}/content`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-venue-code": venue.accessCode,
        },
        body: JSON.stringify({ memberId, verified: true }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to verify content");
      }

      await refreshVenueData();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to verify content");
    } finally {
      setReviewingId(null);
    }
  };

  const venueTypeLabel = (t: string) => {
    const map: Record<string, string> = {
      nightclub: "Nightclub", lounge: "Lounge / Bar", rooftop: "Rooftop",
      beach_club: "Beach Club", restaurant: "Restaurant & Bar", hotel: "Hotel Venue",
    };
    return map[t] || t || "—";
  };

  // Count total pending applications across all events
  const totalPending = events.reduce((sum, e) => sum + e.rsvps.filter(r => r.status === "pending").length, 0);

  // ── Loading Screen ──
  if (!venue) {
    return (
      <div className="min-h-screen hero-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[var(--pink)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[var(--text-muted)] text-xs tracking-widest uppercase">Loading venue dashboard...</p>
        </div>
      </div>
    );
  }

  // ── Pending Approval ──
  if (pending) {
    return (
      <div className="min-h-screen hero-bg flex items-center justify-center px-6">
        <div className="max-w-md text-center animate-fade-in-up">
          <div className="w-16 h-16 border border-[var(--border-pink)] mx-auto mb-8 flex items-center justify-center animate-pulse-glow">
            <div className="w-6 h-6 gold-gradient rotate-45" />
          </div>
          <h1 className="text-2xl font-light tracking-[0.15em] text-white mb-4">Under Review</h1>
          <div className="divider-gold mx-auto mb-6 w-12" />
          <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-3">
            Your venue registration for <strong className="text-[var(--pink)]">{venue.name}</strong> is currently under review.
          </p>
          <p className="text-[var(--text-muted)] text-xs leading-relaxed mb-8">
            Our partnerships team will reach out within 48 hours to discuss next steps.
          </p>
          <button className="btn-outline" onClick={() => signOut({ callbackUrl: "/" })}>Sign Out</button>
        </div>
      </div>
    );
  }

  // ── Venue Dashboard ──
  const upcomingEvents = events.filter(e => e.status === "upcoming" || e.status === "active");
  const pastEvents = events.filter(e => e.status === "completed");

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Header */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-[var(--border)]">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-7 h-7 border border-[var(--border-pink)] flex items-center justify-center">
              <div className="w-2.5 h-2.5 gold-gradient rotate-45" />
            </div>
            <span className="text-xs tracking-[0.3em] text-[var(--text-secondary)] uppercase">Glow Pass</span>
          </Link>
          <span className="text-[0.55rem] tracking-[0.2em] text-[var(--text-muted)] uppercase">Venue Portal</span>
        </div>
        <button className="text-[0.6rem] tracking-[0.15em] text-[var(--text-muted)] uppercase hover:text-[var(--pink)] transition-colors"
          onClick={() => signOut({ callbackUrl: "/" })}>Sign Out</button>
      </nav>

      {/* Tabs */}
      <div className="border-b border-[var(--border)] px-8 flex gap-0">
        {(["overview", "events"] as const).map((t) => (
          <button key={t} className={`tab ${tab === t ? "tab-active" : ""} relative`} onClick={() => setTab(t)}>
            {t}
            {t === "events" && totalPending > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-[var(--pink)] text-white text-[0.55rem] font-bold rounded-full flex items-center justify-center">
                {totalPending}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="max-w-5xl mx-auto px-8 py-8">
        {/* Global success message */}
        {successMsg && (
          <div className="p-3 border border-[var(--success)] bg-[rgba(74,222,128,0.05)] mb-4 rounded-lg animate-fade-in">
            <p className="text-[var(--success)] text-xs">{successMsg}</p>
          </div>
        )}

        {/* ── OVERVIEW TAB ── */}
        {tab === "overview" && (
          <div className="animate-fade-in">
            <div className="mb-8">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[0.6rem] tracking-[0.3em] text-[var(--text-muted)] uppercase mb-2">Welcome back</p>
                  <h1 className="text-3xl font-light tracking-[0.1em] text-white mb-1">{venue.name}</h1>
                  <p className="text-[var(--text-muted)] text-xs">{venue.location} &middot; {venueTypeLabel(venue.venueType)}</p>
                </div>
                <span className="badge badge-active">Active</span>
              </div>
            </div>

            {/* Pending alert */}
            {totalPending > 0 && (
              <div className="p-4 mb-6 rounded-lg border border-[var(--warning)]" style={{ background: "rgba(251,191,36,0.06)" }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[var(--warning)] flex items-center justify-center">
                      <span className="text-black text-sm font-bold">{totalPending}</span>
                    </div>
                    <div>
                      <p className="text-sm text-white font-medium">Pending Creator Applications</p>
                      <p className="text-xs text-[var(--text-muted)]">Creators are waiting for your approval</p>
                    </div>
                  </div>
                  <button className="btn-gold btn-sm" onClick={() => setTab("events")}>Review Now</button>
                </div>
              </div>
            )}

            {/* Stats */}
            {stats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                {[
                  { value: stats.totalEvents, label: "Total Events" },
                  { value: stats.totalConfirmed, label: "Accepted Creators" },
                  { value: stats.totalAttended, label: "Total Attended" },
                  { value: stats.totalContent, label: "Content Posted" },
                ].map((s, i) => (
                  <div key={i} className="stat-card">
                    <div className="stat-value">{s.value}</div>
                    <div className="stat-label">{s.label}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Venue Info Card */}
            <div className="glass-card-gold p-6 mb-8">
              <p className="text-[0.6rem] tracking-[0.2em] text-[var(--text-muted)] uppercase mb-4">Venue Details</p>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { label: "Contact", value: venue.contactName },
                  { label: "Email", value: venue.contactEmail },
                  { label: "Instagram", value: venue.instagram ? `@${venue.instagram}` : "—" },
                  { label: "Capacity", value: venue.capacity ? venue.capacity.toString() : "—" },
                  { label: "Access Code", value: venue.accessCode, mono: true },
                  { label: "Partner Since", value: new Date(venue.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" }) },
                ].map((item, i) => (
                  <div key={i} className="flex justify-between py-2 border-b border-[var(--border)]">
                    <span className="text-[0.6rem] tracking-[0.15em] text-[var(--text-muted)] uppercase">{item.label}</span>
                    <span className={`text-sm text-right ${item.mono ? "font-mono text-[var(--pink)]" : "text-[var(--text-primary)]"}`}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Value Prop */}
            <div className="glass-card p-6">
              <p className="text-[0.6rem] tracking-[0.2em] text-[var(--text-muted)] uppercase mb-4">What Glow Pass delivers to your venue</p>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  { icon: "👥", title: "Curated Crowd", desc: "25-40 well-dressed, high-energy women arriving by your specified time." },
                  { icon: "📸", title: "Organic Content", desc: "50-80+ Instagram stories per event tagging your venue. No ad spend." },
                  { icon: "📊", title: "Real-Time Data", desc: "Track applications, approvals, attendance, and content per event." },
                ].map((item, i) => (
                  <div key={i} className="text-center">
                    <div className="text-2xl mb-3">{item.icon}</div>
                    <h4 className="text-xs tracking-[0.15em] text-white uppercase mb-1">{item.title}</h4>
                    <p className="text-[var(--text-muted)] text-[0.7rem] leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── EVENTS TAB ── */}
        {tab === "events" && (
          <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-light tracking-[0.1em] text-white mb-1">Your Events</h2>
                <p className="text-[var(--text-muted)] text-xs">Create events and review creator applications</p>
              </div>
              <button className="btn-gold" onClick={() => setShowCreateEvent(true)}>+ Create Event</button>
            </div>

            {error && (
              <div className="p-3 border border-[var(--danger)] bg-[rgba(248,113,113,0.05)] mb-4 rounded-lg animate-fade-in">
                <p className="text-[var(--danger)] text-xs">{error}</p>
              </div>
            )}

            {/* QR Check-In Section */}
            <div className="glass-card p-4 mb-6 rounded-lg">
              <p className="text-[0.6rem] tracking-[0.2em] text-[var(--text-muted)] uppercase mb-3">QR Check-In</p>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  className="input-field flex-1"
                  placeholder="Paste or enter creator QR token..."
                  value={qrToken}
                  onChange={(e) => { setQrToken(e.target.value); setQrMessage(null); }}
                  onKeyDown={(e) => e.key === "Enter" && handleQrCheckin()}
                />
                <button className="btn-gold btn-sm" onClick={handleQrCheckin} disabled={!qrToken.trim()}>
                  Check In
                </button>
                <button
                  className="btn-outline btn-sm"
                  onClick={() => { setShowScanner(!showScanner); setScanResult(""); }}
                >
                  📷 Scan QR
                </button>
              </div>
              {qrMessage && (
                <p className={`text-xs mt-2 animate-fade-in ${qrMessage.type === "success" ? "text-[var(--success)]" : "text-[var(--danger)]"}`}>
                  {qrMessage.text}
                </p>
              )}
              {scanResult && (
                <p className={`text-xs mt-2 animate-fade-in ${scanResult.startsWith("✅") ? "text-[var(--success)]" : "text-[var(--danger)]"}`}>
                  {scanResult}
                </p>
              )}
              {showScanner && (
                <div className="mt-4">
                  <div className="glass-card p-4 rounded-lg">
                    <div id="qr-reader" style={{ width: '100%', maxWidth: 400 }} />
                    <button
                      className="btn-outline btn-sm mt-3 w-full"
                      onClick={() => setShowScanner(false)}
                    >
                      Close Scanner
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Event Templates Section */}
            {templates.length > 0 && (
              <div className="mb-6">
                <p className="text-[0.6rem] tracking-[0.2em] text-[var(--text-muted)] uppercase mb-3">Templates</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {templates.map((tpl) => (
                    <div key={tpl.id} className="glass-card p-3 rounded-lg border border-[var(--border)]">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-sm text-white font-medium truncate">{tpl.title}</p>
                          <p className="text-[0.55rem] text-[var(--text-muted)]">{tpl.time}{tpl.dressCode ? ` · ${tpl.dressCode}` : ""}</p>
                        </div>
                        <button
                          className="text-[var(--text-muted)] hover:text-[var(--danger)] text-xs transition-colors ml-2 shrink-0"
                          onClick={() => handleDeleteTemplate(tpl.id)}
                          title="Delete template"
                        >
                          &times;
                        </button>
                      </div>
                      <button
                        className="text-[0.6rem] tracking-[0.1em] text-[var(--pink)] hover:text-white transition-colors uppercase"
                        onClick={() => handleUseTemplate(tpl)}
                      >
                        Use Template
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upcoming Events with Application Management */}
            <div className="mb-10">
              <p className="text-[0.6rem] tracking-[0.2em] text-[var(--text-muted)] uppercase mb-4">Upcoming</p>

              {upcomingEvents.length === 0 ? (
                <div className="glass-card p-10 text-center rounded-lg">
                  <div className="text-3xl mb-4">📅</div>
                  <p className="text-[var(--text-secondary)] text-sm mb-2">No upcoming events yet</p>
                  <p className="text-[var(--text-muted)] text-xs mb-6">Create your first event and creators will start applying.</p>
                  <button className="btn-gold" onClick={() => setShowCreateEvent(true)}>Create Your First Event</button>
                </div>
              ) : (
                <div className="space-y-6">
                  {upcomingEvents.map((event) => {
                    const pendingApps = event.rsvps.filter(r => r.status === "pending");
                    const acceptedApps = event.rsvps.filter(r => r.status === "confirmed" || r.status === "attended" || r.status === "no_show");
                    const declinedApps = event.rsvps.filter(r => r.status === "declined");

                    return (
                      <div key={event.id} className="glass-card-gold rounded-lg overflow-hidden">
                        {/* Event Header */}
                        <div className="p-5 border-b border-[var(--border)]">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <div className="flex items-center gap-3 mb-1">
                                <h3 className="text-lg font-bold text-white">{event.title}</h3>
                                <span className={`badge badge-${event.status}`}>{event.status}</span>
                              </div>
                              <p className="text-xs text-[var(--text-muted)]">
                                {new Date(event.date).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })} &middot; {event.time}
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <div className="text-lg font-bold text-[var(--pink)]">{acceptedApps.length} / {event.capacity}</div>
                                <div className="text-[0.55rem] text-[var(--text-muted)] uppercase tracking-wider">Accepted</div>
                              </div>
                              <button
                                className="btn-outline btn-sm text-[0.55rem]"
                                onClick={() => handleCompleteEvent(event.id)}
                              >
                                Complete Event
                              </button>
                            </div>
                          </div>

                          {/* Capacity bar */}
                          <div className="mt-3">
                            <div className="h-1.5 bg-[var(--border)] rounded-full overflow-hidden">
                              <div className="h-full rounded-full transition-all duration-500"
                                style={{
                                  width: `${Math.min((acceptedApps.length / event.capacity) * 100, 100)}%`,
                                  background: "linear-gradient(90deg, var(--pink-dark), var(--pink), var(--purple-light))",
                                }} />
                            </div>
                          </div>

                          {/* Quick stats */}
                          <div className="flex gap-6 mt-3">
                            <span className="text-[0.55rem] text-[var(--warning)] tracking-wider uppercase">
                              {pendingApps.length} pending
                            </span>
                            <span className="text-[0.55rem] text-[var(--success)] tracking-wider uppercase">
                              {acceptedApps.length} accepted
                            </span>
                            <span className="text-[0.55rem] text-[var(--text-muted)] tracking-wider uppercase">
                              {declinedApps.length} declined
                            </span>
                          </div>
                        </div>

                        {/* Pending Applications */}
                        {pendingApps.length > 0 && (
                          <div className="p-5 border-b border-[var(--border)]" style={{ background: "rgba(251,191,36,0.03)" }}>
                            <p className="text-[0.6rem] tracking-[0.2em] text-[var(--warning)] uppercase mb-3 flex items-center gap-2">
                              <span className="w-2 h-2 bg-[var(--warning)] rounded-full animate-pulse" />
                              Pending Applications ({pendingApps.length})
                            </p>
                            <div className="space-y-3">
                              {pendingApps.map((rsvp) => (
                                <div key={rsvp.memberId} className="flex items-center justify-between p-3 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[var(--border)]">
                                  <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full border border-[var(--border-pink)] flex items-center justify-center">
                                      <span className="text-sm text-[var(--pink)]">{rsvp.memberName.charAt(0)}</span>
                                    </div>
                                    <div>
                                      <button
                                        className="text-sm text-white font-medium hover:text-[var(--pink)] transition-colors text-left"
                                        onClick={() => handleViewCreatorProfile(rsvp.memberId)}
                                      >
                                        {rsvp.memberName}
                                      </button>
                                      <div className="flex items-center gap-3">
                                        {rsvp.instagram && (
                                          <span className="text-xs text-[var(--text-muted)]">@{rsvp.instagram}</span>
                                        )}
                                        {rsvp.followerCount && (
                                          <span className="text-xs text-[var(--pink)]">{rsvp.followerCount.toLocaleString()} followers</span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <button
                                      className="btn-success btn-sm"
                                      onClick={() => handleReviewCreator(event.id, rsvp.memberId, "confirmed")}
                                      disabled={reviewingId === rsvp.memberId}
                                    >
                                      {reviewingId === rsvp.memberId ? "..." : "Accept"}
                                    </button>
                                    <button
                                      className="btn-danger btn-sm"
                                      onClick={() => handleReviewCreator(event.id, rsvp.memberId, "declined")}
                                      disabled={reviewingId === rsvp.memberId}
                                    >
                                      Decline
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Accepted Creators */}
                        {acceptedApps.length > 0 && (
                          <div className="p-5">
                            <p className="text-[0.6rem] tracking-[0.2em] text-[var(--success)] uppercase mb-3">
                              Accepted Creators ({acceptedApps.length})
                            </p>
                            <div className="space-y-3">
                              {acceptedApps.map((rsvp) => (
                                <div key={rsvp.memberId} className="p-3 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[var(--border)]">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-full border border-[var(--border-pink)] flex items-center justify-center">
                                        <span className="text-xs text-[var(--pink)]">{rsvp.memberName.charAt(0)}</span>
                                      </div>
                                      <div>
                                        <p className="text-sm text-white font-medium">{rsvp.memberName}</p>
                                        <div className="flex items-center gap-2">
                                          {rsvp.instagram && <span className="text-[0.55rem] text-[var(--text-muted)]">@{rsvp.instagram}</span>}
                                          {rsvp.followerCount && <span className="text-[0.55rem] text-[var(--pink)]">{rsvp.followerCount.toLocaleString()} followers</span>}
                                          {rsvp.qrToken && (
                                            <span className="text-[0.5rem] font-mono text-[var(--text-muted)] bg-[rgba(255,255,255,0.05)] px-1.5 py-0.5 rounded" title="QR Check-In Token">
                                              QR: {rsvp.qrToken}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                      {/* Status: confirmed → show check-in buttons */}
                                      {rsvp.status === "confirmed" && (
                                        <>
                                          <button
                                            className="btn-success btn-sm"
                                            onClick={() => handleCheckin(event.id, rsvp.memberId, "checkin")}
                                            disabled={reviewingId === rsvp.memberId}
                                          >
                                            {reviewingId === rsvp.memberId ? "..." : "Check In"}
                                          </button>
                                          <button
                                            className="btn-danger btn-sm"
                                            onClick={() => handleCheckin(event.id, rsvp.memberId, "no_show")}
                                            disabled={reviewingId === rsvp.memberId}
                                          >
                                            No Show
                                          </button>
                                        </>
                                      )}

                                      {/* Status: attended → green badge */}
                                      {rsvp.status === "attended" && (
                                        <span className="px-3 py-1 rounded-full text-[0.6rem] font-bold tracking-wider uppercase bg-[rgba(74,222,128,0.15)] text-[var(--success)] border border-[var(--success)]">
                                          Checked In ✓
                                        </span>
                                      )}

                                      {/* Status: no_show → red badge */}
                                      {rsvp.status === "no_show" && (
                                        <span className="px-3 py-1 rounded-full text-[0.6rem] font-bold tracking-wider uppercase bg-[rgba(248,113,113,0.15)] text-[var(--danger)] border border-[var(--danger)]">
                                          No Show
                                        </span>
                                      )}

                                      {/* Block creator button */}
                                      <button
                                        className="px-2 py-1 text-[0.5rem] tracking-wider uppercase text-[var(--danger)] border border-[var(--danger)] rounded hover:bg-[rgba(248,113,113,0.15)] transition-colors"
                                        onClick={() => handleBlockCreator(rsvp.memberId)}
                                        title="Block this creator"
                                      >
                                        Block
                                      </button>
                                    </div>
                                  </div>

                                  {/* Content section — only for attended creators */}
                                  {rsvp.status === "attended" && (
                                    <div className="mt-3 pt-3 border-t border-[var(--border)]">
                                      {/* Content submitted — show links + verify button */}
                                      {rsvp.contentStatus === "submitted" && (
                                        <div>
                                          <p className="text-[0.55rem] tracking-[0.15em] text-[var(--text-muted)] uppercase mb-2">Submitted Content</p>
                                          <div className="space-y-1.5 mb-2">
                                            {rsvp.contentProofs?.map((proof, idx) => (
                                              <div key={idx} className="flex items-center gap-2">
                                                <span className="text-[0.55rem] text-[var(--text-muted)] uppercase w-12">{proof.type}</span>
                                                <a
                                                  href={proof.link}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  className="text-xs text-[var(--pink)] hover:text-white transition-colors truncate max-w-[280px]"
                                                >
                                                  {proof.link}
                                                </a>
                                                {proof.verified && (
                                                  <span className="text-[0.5rem] text-[var(--success)]">✓</span>
                                                )}
                                              </div>
                                            ))}
                                          </div>
                                          <button
                                            className="btn-gold btn-sm"
                                            onClick={() => handleVerifyContent(event.id, rsvp.memberId)}
                                            disabled={reviewingId === rsvp.memberId}
                                          >
                                            {reviewingId === rsvp.memberId ? "..." : "Verify Content"}
                                          </button>
                                        </div>
                                      )}

                                      {/* Content verified */}
                                      {rsvp.contentStatus === "verified" && (
                                        <div>
                                          <div className="flex items-center gap-2">
                                            <span className="px-3 py-1 rounded-full text-[0.6rem] font-bold tracking-wider uppercase bg-[rgba(74,222,128,0.15)] text-[var(--success)] border border-[var(--success)]">
                                              Content Verified ✓
                                            </span>
                                          </div>
                                          {rsvp.contentProofs && rsvp.contentProofs.length > 0 && (
                                            <div className="space-y-1 mt-2">
                                              {rsvp.contentProofs.map((proof, idx) => (
                                                <a
                                                  key={idx}
                                                  href={proof.link}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  className="block text-xs text-[var(--text-muted)] hover:text-[var(--pink)] transition-colors truncate max-w-[320px]"
                                                >
                                                  {proof.type}: {proof.link}
                                                </a>
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                      )}

                                      {/* Content not yet submitted */}
                                      {(!rsvp.contentStatus || rsvp.contentStatus === "not_submitted") && (
                                        <p className="text-[0.55rem] tracking-[0.15em] text-[var(--text-muted)] uppercase italic">
                                          Awaiting Content
                                        </p>
                                      )}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Empty state */}
                        {event.rsvps.length === 0 && (
                          <div className="p-5 text-center">
                            <p className="text-[var(--text-muted)] text-xs italic">
                              No applications yet. Creators will appear here as they apply.
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Past Events */}
            {pastEvents.length > 0 && (
              <div>
                <p className="text-[0.6rem] tracking-[0.2em] text-[var(--text-muted)] uppercase mb-4">Past Events</p>
                <div className="overflow-x-auto">
                  <table className="data-table">
                    <thead>
                      <tr><th>Event</th><th>Date</th><th>Accepted</th><th>Attended</th><th>Content</th><th>Status</th></tr>
                    </thead>
                    <tbody>
                      {pastEvents.map((e) => (
                        <tr key={e.id}>
                          <td className="font-medium">{e.title}</td>
                          <td className="text-[var(--text-muted)] text-xs">{new Date(e.date).toLocaleDateString()}</td>
                          <td>{e.confirmed}</td>
                          <td>{e.attended}</td>
                          <td>{e.contentPosted}</td>
                          <td><span className={`badge badge-${e.status}`}>{e.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Create Event Modal ── */}
      {showCreateEvent && (
        <div className="modal-overlay" onClick={() => setShowCreateEvent(false)}>
          <div className="modal-content p-0" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-[var(--border)]">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white tracking-[0.05em]">Create New Event</h3>
                <button className="text-[var(--text-muted)] hover:text-white transition-colors text-xl" onClick={() => setShowCreateEvent(false)}>&times;</button>
              </div>
              <p className="text-[var(--text-muted)] text-xs mt-1">
                Set up an event at {venue.name}. Creators will see it and can apply to join.
              </p>
            </div>

            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              <div>
                <label className="label-text">Event Title *</label>
                <input type="text" className="input-field" placeholder="e.g., Friday Night Glow"
                  value={eventForm.title} onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-text">Date *</label>
                  <input type="date" className="input-field" value={eventForm.date} onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })} />
                </div>
                <div>
                  <label className="label-text">Time *</label>
                  <input type="text" className="input-field" placeholder="e.g., 10:00 PM" value={eventForm.time} onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-text">Arrival Deadline</label>
                  <input type="text" className="input-field" placeholder="e.g., 10:30 PM" value={eventForm.arrivalDeadline} onChange={(e) => setEventForm({ ...eventForm, arrivalDeadline: e.target.value })} />
                </div>
                <div>
                  <label className="label-text">Creator Spots</label>
                  <input type="number" className="input-field" placeholder="30" value={eventForm.capacity} onChange={(e) => setEventForm({ ...eventForm, capacity: e.target.value })} />
                </div>
              </div>

              <div>
                <label className="label-text">Dress Code</label>
                <input type="text" className="input-field" placeholder="e.g., Smart Elegant" value={eventForm.dressCode} onChange={(e) => setEventForm({ ...eventForm, dressCode: e.target.value })} />
              </div>

              <div>
                <label className="label-text">Description</label>
                <textarea className="textarea-field" placeholder="Describe the experience, vibe, and what creators can expect..."
                  value={eventForm.description} onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })} />
              </div>

              <div>
                <label className="label-text">Perks (comma-separated)</label>
                <input type="text" className="input-field" placeholder="e.g., Open Bar, VIP Table, Bottle Service"
                  value={eventForm.perks} onChange={(e) => setEventForm({ ...eventForm, perks: e.target.value })} />
              </div>

              {/* Save as Template checkbox */}
              <label className="flex items-center gap-3 cursor-pointer py-1">
                <input
                  type="checkbox"
                  checked={saveAsTemplate}
                  onChange={(e) => setSaveAsTemplate(e.target.checked)}
                  className="w-4 h-4 accent-[var(--pink)] rounded border-[var(--border)]"
                />
                <span className="text-xs text-[var(--text-secondary)]">Save as Template</span>
              </label>

              {error && <p className="text-[var(--danger)] text-xs animate-fade-in">{error}</p>}
            </div>

            <div className="p-6 border-t border-[var(--border)] flex items-center justify-end gap-3">
              <button className="btn-outline btn-sm" onClick={() => setShowCreateEvent(false)}>Cancel</button>
              <button className="btn-gold" onClick={handleCreateEvent} disabled={creating}>
                {creating ? "Creating..." : "Create Event"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Creator Profile Preview Modal ── */}
      {showCreatorProfile && (
        <div className="modal-overlay" onClick={() => setShowCreatorProfile(false)}>
          <div className="modal-content p-0" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "480px" }}>
            <div className="p-6 border-b border-[var(--border)]">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white tracking-[0.05em]">Creator Profile</h3>
                <button className="text-[var(--text-muted)] hover:text-white transition-colors text-xl" onClick={() => setShowCreatorProfile(false)}>&times;</button>
              </div>
            </div>

            <div className="p-6 max-h-[70vh] overflow-y-auto">
              {loadingProfile && (
                <div className="text-center py-10">
                  <p className="text-[var(--text-muted)] text-sm">Loading profile...</p>
                </div>
              )}

              {!loadingProfile && !creatorProfile && (
                <div className="text-center py-10">
                  <p className="text-[var(--text-muted)] text-sm">Could not load creator profile.</p>
                </div>
              )}

              {!loadingProfile && creatorProfile && (
                <div className="space-y-5">
                  {/* Header */}
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full border border-[var(--border-pink)] flex items-center justify-center">
                      <span className="text-xl text-[var(--pink)]">{creatorProfile.name?.charAt(0) || "?"}</span>
                    </div>
                    <div>
                      <p className="text-lg text-white font-medium">{creatorProfile.name}</p>
                      {creatorProfile.instagram && (
                        <p className="text-xs text-[var(--text-muted)]">@{creatorProfile.instagram}</p>
                      )}
                      {creatorProfile.tier && (
                        <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[0.5rem] font-bold tracking-wider uppercase bg-[rgba(var(--pink-rgb,236,72,153),0.15)] text-[var(--pink)] border border-[var(--border-pink)]">
                          {creatorProfile.tier}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Stats grid */}
                  <div className="grid grid-cols-2 gap-3">
                    {creatorProfile.followerCount !== undefined && (
                      <div className="p-3 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[var(--border)] text-center">
                        <div className="text-lg font-bold text-[var(--pink)]">{creatorProfile.followerCount.toLocaleString()}</div>
                        <div className="text-[0.5rem] text-[var(--text-muted)] uppercase tracking-wider">Followers</div>
                      </div>
                    )}
                    {creatorProfile.reliabilityScore !== undefined && (
                      <div className="p-3 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[var(--border)] text-center">
                        <div className="text-lg font-bold text-[var(--success)]">{creatorProfile.reliabilityScore}%</div>
                        <div className="text-[0.5rem] text-[var(--text-muted)] uppercase tracking-wider">Reliability</div>
                      </div>
                    )}
                    {creatorProfile.attendanceRate !== undefined && (
                      <div className="p-3 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[var(--border)] text-center">
                        <div className="text-lg font-bold text-white">{creatorProfile.attendanceRate}%</div>
                        <div className="text-[0.5rem] text-[var(--text-muted)] uppercase tracking-wider">Attendance Rate</div>
                      </div>
                    )}
                    {creatorProfile.noShows !== undefined && (
                      <div className="p-3 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[var(--border)] text-center">
                        <div className={`text-lg font-bold ${creatorProfile.noShows > 0 ? "text-[var(--danger)]" : "text-[var(--success)]"}`}>{creatorProfile.noShows}</div>
                        <div className="text-[0.5rem] text-[var(--text-muted)] uppercase tracking-wider">No-Shows</div>
                      </div>
                    )}
                  </div>

                  {/* Strikes */}
                  {creatorProfile.strikes !== undefined && creatorProfile.strikes > 0 && (
                    <div className="p-3 rounded-lg border border-[var(--danger)] bg-[rgba(248,113,113,0.05)]">
                      <p className="text-xs text-[var(--danger)] font-medium">
                        {creatorProfile.strikes} Strike{creatorProfile.strikes !== 1 ? "s" : ""}
                      </p>
                    </div>
                  )}

                  {/* Event History */}
                  {creatorProfile.eventHistory && creatorProfile.eventHistory.length > 0 && (
                    <div>
                      <p className="text-[0.6rem] tracking-[0.2em] text-[var(--text-muted)] uppercase mb-3">Event History</p>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {creatorProfile.eventHistory.map((eh, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2 rounded bg-[rgba(255,255,255,0.02)] border border-[var(--border)]">
                            <div>
                              <p className="text-xs text-white">{eh.eventTitle}</p>
                              <p className="text-[0.5rem] text-[var(--text-muted)]">{new Date(eh.date).toLocaleDateString()}</p>
                            </div>
                            <span className={`badge badge-${eh.status} text-[0.5rem]`}>{eh.status}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-[var(--border)] flex justify-end">
              <button className="btn-outline btn-sm" onClick={() => setShowCreatorProfile(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

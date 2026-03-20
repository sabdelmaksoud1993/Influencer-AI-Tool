"use client";

import { useState, useEffect, useCallback } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";

const ADMIN_KEY = "cercle2024";

interface Application {
  id: string;
  fullName: string;
  instagram: string;
  followerCount: number;
  email: string;
  phone: string;
  city: string;
  whyJoin: string;
  referredBy: string;
  heardFrom: string;
  status: string;
  appliedAt: string;
  reviewNote?: string;
}

interface Member {
  id: string;
  fullName: string;
  instagram: string;
  followerCount: number;
  email: string;
  phone: string;
  accessCode: string;
  tier: string;
  status: string;
  eventsAttended: number;
  contentScore: number;
  joinedAt: string;
  strikes: number;
  noShows: number;
  reliabilityScore: number;
  blacklisted?: boolean;
}

interface Event {
  id: string;
  venueName: string;
  title: string;
  date: string;
  time: string;
  arrivalDeadline: string;
  dressCode: string;
  description: string;
  capacity: number;
  perks: string[];
  status: string;
  rsvps: {
    memberId: string;
    memberName: string;
    instagram?: string;
    followerCount?: number;
    status: string;
    checkedInAt?: string;
    contentProofs?: { link: string; type: string; submittedAt: string; verified?: boolean; verifiedAt?: string; verifiedBy?: string }[];
    contentStatus?: string;
  }[];
}

interface Venue {
  id: string;
  name: string;
  location: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  instagram: string;
  description: string;
  venueType: string;
  capacity: number;
  accessCode: string;
  dealType: string;
  rate: string;
  notes: string;
  status: string;
  totalEvents: number;
  createdAt: string;
}

interface Stats {
  totalApplications: number;
  pendingApplications: number;
  totalMembers: number;
  activeMembers: number;
  totalEvents: number;
  upcomingEvents: number;
  totalVenues: number;
  avgAttendanceRate: number;
  suspendedMembers: number;
  blacklistedMembers: number;
  avgReliabilityScore: number;
  totalNoShows: number;
  totalContentVerified: number;
}

interface AnalyticsCreator {
  rank: number;
  name: string;
  instagram: string;
  contentScore: number;
  eventsAttended: number;
  reliabilityScore: number;
  tier: string;
}

interface AnalyticsVenue {
  venueName: string;
  totalEvents: number;
  totalCreators: number;
  noShows: number;
  contentVerified: number;
  attendanceRate: number;
}

interface AnalyticsData {
  attendanceRate: number;
  noShowRate: number;
  contentRate: number;
  avgReliabilityScore: number;
  suspendedMembers: number;
  blacklistedMembers: number;
  creatorLeaderboard: AnalyticsCreator[];
  venuePerformance: AnalyticsVenue[];
}

const headers = { "x-admin-key": ADMIN_KEY };

export default function AdminPage() {
  const [tab, setTab] = useState<"overview" | "applications" | "members" | "events" | "venues" | "analytics">("overview");

  const [stats, setStats] = useState<Stats | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [reviewNote, setReviewNote] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [accessCodeResult, setAccessCodeResult] = useState("");

  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [showCreateVenue, setShowCreateVenue] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [venueAccessCodeResult, setVenueAccessCodeResult] = useState("");

  const [memberFilter, setMemberFilter] = useState<string>("all");

  const [eventForm, setEventForm] = useState({
    title: "", venueName: "", date: "", time: "", arrivalDeadline: "",
    dressCode: "", description: "", capacity: "30", perks: "",
  });

  const [venueForm, setVenueForm] = useState({
    name: "", location: "", contactName: "", contactEmail: "", contactPhone: "",
    instagram: "", venueType: "", capacity: "", dealType: "per_head", rate: "", notes: "",
  });

  const [appFilter, setAppFilter] = useState<string>("all");

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, appsRes, membersRes, eventsRes, venuesRes] = await Promise.all([
        fetch("/api/stats", { headers }),
        fetch("/api/applications", { headers }),
        fetch("/api/members", { headers }),
        fetch("/api/events", { headers }),
        fetch("/api/venues", { headers }),
      ]);
      setStats(await statsRes.json());
      setApplications(await appsRes.json());
      setMembers(await membersRes.json());
      setEvents(await eventsRes.json());
      setVenues(await venuesRes.json());
    } catch (e) {
      console.error("Failed to fetch data:", e);
    }
  }, []);

  const fetchAnalytics = useCallback(async () => {
    try {
      const res = await fetch("/api/analytics", { headers });
      if (res.ok) {
        const data = await res.json();
        setAnalytics({
          attendanceRate: data.overview?.attendanceRate ?? 0,
          noShowRate: data.overview?.noShowRate ?? 0,
          contentRate: data.overview?.contentRate ?? 0,
          avgReliabilityScore: data.overview?.avgReliabilityScore ?? 100,
          suspendedMembers: data.overview?.suspendedMembers ?? 0,
          blacklistedMembers: data.overview?.blacklistedMembers ?? 0,
          creatorLeaderboard: data.leaderboard || [],
          venuePerformance: data.venueStats || [],
        });
      }
    } catch (e) {
      console.error("Failed to fetch analytics:", e);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (tab === "analytics") fetchAnalytics();
  }, [tab, fetchAnalytics]);

  const handleApplicationAction = async (id: string, status: string) => {
    setActionLoading(true);
    setAccessCodeResult("");
    try {
      const res = await fetch(`/api/applications/${id}`, {
        method: "PATCH",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ status, reviewNote }),
      });
      const data = await res.json();
      if (data.accessCode) {
        setAccessCodeResult(data.accessCode);
      } else {
        setSelectedApp(null);
        setReviewNote("");
      }
      fetchData();
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateEvent = async () => {
    setActionLoading(true);
    try {
      await fetch("/api/events", {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({
          ...eventForm,
          perks: eventForm.perks.split(",").map(p => p.trim()).filter(Boolean),
        }),
      });
      setShowCreateEvent(false);
      setEventForm({ title: "", venueName: "", date: "", time: "", arrivalDeadline: "", dressCode: "", description: "", capacity: "30", perks: "" });
      fetchData();
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateVenue = async () => {
    setActionLoading(true);
    try {
      await fetch("/api/venues", {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify(venueForm),
      });
      setShowCreateVenue(false);
      setVenueForm({ name: "", location: "", contactName: "", contactEmail: "", contactPhone: "", instagram: "", venueType: "", capacity: "", dealType: "per_head", rate: "", notes: "" });
      fetchData();
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleVenueAction = async (venueId: string, status: string) => {
    setActionLoading(true);
    setVenueAccessCodeResult("");
    try {
      const res = await fetch(`/api/venues/${venueId}/approve`, {
        method: "PATCH",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (status === "active" && data.venue?.accessCode) {
        setVenueAccessCodeResult(data.venue.accessCode);
      } else {
        setSelectedVenue(null);
      }
      fetchData();
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleBlacklistMember = async (accessCode: string) => {
    const reason = prompt("Enter reason for blacklisting this member:");
    if (!reason) return;
    setActionLoading(true);
    try {
      await fetch(`/api/members/${accessCode}/blacklist`, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      fetchData();
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteEvent = async (eventId: string) => {
    const confirmed = confirm("Are you sure you want to complete this event? This will mark all confirmed RSVPs as no-shows and apply strikes.");
    if (!confirmed) return;
    setActionLoading(true);
    try {
      await fetch(`/api/events/${eventId}/complete`, {
        method: "POST",
        headers,
      });
      fetchData();
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const pendingVenues = venues.filter(v => v.status === "pending");

  const filteredApps = appFilter === "all"
    ? applications
    : applications.filter(a => a.status === appFilter);

  const filteredMembers = memberFilter === "all"
    ? members
    : memberFilter === "blacklisted"
    ? members.filter(m => m.blacklisted)
    : members.filter(m => m.status === memberFilter);

  const tierLabel = (t: string) =>
    t === "inner_circle" ? "Inner Circle" : t === "muse" ? "Muse" : "New";

  const dealLabel = (d: string) =>
    ({ per_head: "Per Head", flat_fee: "Flat Fee", monthly: "Monthly", commission: "Commission", hybrid: "Hybrid" }[d] || d);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Header */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-[var(--border)]">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-7 h-7 border border-[var(--border-pink)] flex items-center justify-center">
              <div className="w-2.5 h-2.5 gold-gradient rotate-45" />
            </div>
            <span className="text-xs tracking-[0.3em] text-[var(--text-secondary)] uppercase">
              Glow Pass
            </span>
          </Link>
          <span className="text-[0.55rem] tracking-[0.2em] text-[var(--text-muted)] uppercase">
            Admin
          </span>
        </div>
        <button
          className="text-[0.6rem] tracking-[0.15em] text-[var(--text-muted)] uppercase hover:text-[var(--pink)] transition-colors"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          Logout
        </button>
      </nav>

      {/* Tabs */}
      <div className="border-b border-[var(--border)] px-8 flex gap-0 overflow-x-auto">
        {(["overview", "applications", "members", "events", "venues", "analytics"] as const).map((t) => (
          <button
            key={t}
            className={`tab ${tab === t ? "tab-active" : ""}`}
            onClick={() => setTab(t)}
          >
            {t}
            {t === "applications" && stats && stats.pendingApplications > 0 && (
              <span className="ml-2 w-5 h-5 inline-flex items-center justify-center text-[0.5rem] bg-[var(--pink)] text-[var(--bg-primary)] rounded-full font-bold">
                {stats.pendingApplications}
              </span>
            )}
            {t === "venues" && pendingVenues.length > 0 && (
              <span className="ml-2 w-5 h-5 inline-flex items-center justify-center text-[0.5rem] bg-[var(--pink)] text-[var(--bg-primary)] rounded-full font-bold">
                {pendingVenues.length}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8">

        {/* ── OVERVIEW TAB ── */}
        {tab === "overview" && stats && (
          <div className="animate-fade-in">
            <h2
              className="text-xl font-light tracking-[0.1em] text-white mb-6"

            >
              Dashboard
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
              {[
                { value: stats.totalApplications, label: "Total Applications" },
                { value: stats.pendingApplications, label: "Pending Review" },
                { value: stats.activeMembers, label: "Active Members" },
                { value: stats.upcomingEvents, label: "Upcoming Events" },
              ].map((s, i) => (
                <div key={i} className="stat-card">
                  <div className="stat-value">{s.value}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
              <div className="stat-card">
                <div className="stat-value">{stats.totalVenues}</div>
                <div className="stat-label">Partner Venues</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{stats.avgAttendanceRate}%</div>
                <div className="stat-label">Avg Attendance Rate</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{stats.avgReliabilityScore ?? "—"}</div>
                <div className="stat-label">Avg Reliability Score</div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="stat-card">
                <div className="stat-value">{stats.suspendedMembers ?? 0}</div>
                <div className="stat-label">Suspended Members</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{stats.blacklistedMembers ?? 0}</div>
                <div className="stat-label">Blacklisted Members</div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-10">
              <h3 className="text-[0.65rem] tracking-[0.2em] text-[var(--text-muted)] uppercase mb-4">
                Quick Actions
              </h3>
              <div className="flex flex-wrap gap-3">
                <button className="btn-outline btn-sm" onClick={() => setTab("applications")}>
                  Review Applications
                </button>
                <button className="btn-outline btn-sm" onClick={() => { setTab("events"); setShowCreateEvent(true); }}>
                  Create Event
                </button>
                <button className="btn-outline btn-sm" onClick={() => { setTab("venues"); setShowCreateVenue(true); }}>
                  Add Venue
                </button>
                <button className="btn-outline btn-sm" onClick={() => setTab("analytics")}>
                  View Analytics
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── APPLICATIONS TAB ── */}
        {tab === "applications" && (
          <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h2
                className="text-xl font-light tracking-[0.1em] text-white"

              >
                Applications
              </h2>
              <div className="flex gap-2">
                {["all", "pending", "approved", "waitlisted", "rejected"].map((f) => (
                  <button
                    key={f}
                    className={`text-[0.6rem] tracking-[0.1em] uppercase px-3 py-1.5 transition-all ${
                      appFilter === f
                        ? "text-[var(--pink)] border-b border-[var(--pink)]"
                        : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                    }`}
                    onClick={() => setAppFilter(f)}
                  >
                    {f} {f !== "all" && `(${applications.filter(a => a.status === f).length})`}
                  </button>
                ))}
              </div>
            </div>

            {filteredApps.length === 0 ? (
              <div className="glass-card p-10 text-center">
                <p className="text-[var(--text-muted)] text-sm">No applications found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Instagram</th>
                      <th>Followers</th>
                      <th>City</th>
                      <th>Status</th>
                      <th>Applied</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredApps.map((app) => (
                      <tr key={app.id} onClick={() => { setSelectedApp(app); setReviewNote(""); setAccessCodeResult(""); }}>
                        <td className="font-medium">{app.fullName}</td>
                        <td className="text-[var(--text-secondary)]">@{app.instagram}</td>
                        <td>{app.followerCount.toLocaleString()}</td>
                        <td className="text-[var(--text-secondary)]">{app.city}</td>
                        <td><span className={`badge badge-${app.status}`}>{app.status}</span></td>
                        <td className="text-[var(--text-muted)] text-xs">
                          {new Date(app.appliedAt).toLocaleDateString()}
                        </td>
                        <td>
                          {app.status === "pending" && (
                            <button
                              className="btn-outline btn-sm"
                              onClick={(e) => { e.stopPropagation(); setSelectedApp(app); }}
                            >
                              Review
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── MEMBERS TAB ── */}
        {tab === "members" && (
          <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h2
                className="text-xl font-light tracking-[0.1em] text-white"

              >
                Members ({members.length})
              </h2>
              <div className="flex gap-2">
                {["all", "active", "suspended", "blacklisted"].map((f) => (
                  <button
                    key={f}
                    className={`text-[0.6rem] tracking-[0.1em] uppercase px-3 py-1.5 transition-all ${
                      memberFilter === f
                        ? "text-[var(--pink)] border-b border-[var(--pink)]"
                        : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                    }`}
                    onClick={() => setMemberFilter(f)}
                  >
                    {f} {f !== "all" && `(${f === "blacklisted" ? members.filter(m => m.blacklisted).length : members.filter(m => m.status === f).length})`}
                  </button>
                ))}
              </div>
            </div>

            {filteredMembers.length === 0 ? (
              <div className="glass-card p-10 text-center">
                <p className="text-[var(--text-muted)] text-sm">No members found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Instagram</th>
                      <th>Followers</th>
                      <th>Tier</th>
                      <th>Events</th>
                      <th>Content Score</th>
                      <th>Strikes</th>
                      <th>Reliability</th>
                      <th>No-Shows</th>
                      <th>Access Code</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMembers.map((m) => (
                      <tr key={m.id}>
                        <td className="font-medium">{m.fullName}</td>
                        <td className="text-[var(--text-secondary)]">@{m.instagram}</td>
                        <td>{m.followerCount.toLocaleString()}</td>
                        <td><span className={`badge badge-${m.tier}`}>{tierLabel(m.tier)}</span></td>
                        <td>{m.eventsAttended}</td>
                        <td>{m.contentScore}</td>
                        <td>{m.strikes ?? 0}</td>
                        <td>{m.reliabilityScore ?? "—"}</td>
                        <td>{m.noShows ?? 0}</td>
                        <td className="font-mono text-xs text-[var(--pink)]">{m.accessCode}</td>
                        <td>
                          <div className="flex gap-1 flex-wrap">
                            <span className={`badge badge-${m.status}`}>{m.status}</span>
                            {m.status === "suspended" && (
                              <span className="badge" style={{ background: "var(--warning)", color: "var(--bg-primary)" }}>Suspended</span>
                            )}
                            {m.blacklisted && (
                              <span className="badge" style={{ background: "var(--danger)", color: "#fff" }}>Blacklisted</span>
                            )}
                          </div>
                        </td>
                        <td>
                          {!m.blacklisted && (
                            <button
                              className="btn-sm text-[0.5rem] px-2 py-1 rounded"
                              style={{ background: "var(--danger)", color: "#fff" }}
                              onClick={() => handleBlacklistMember(m.accessCode)}
                              disabled={actionLoading}
                            >
                              Blacklist
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── EVENTS TAB ── */}
        {tab === "events" && (
          <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h2
                className="text-xl font-light tracking-[0.1em] text-white"

              >
                Events ({events.length})
              </h2>
              <button className="btn-gold btn-sm" onClick={() => setShowCreateEvent(true)}>
                Create Event
              </button>
            </div>

            {events.length === 0 && !showCreateEvent ? (
              <div className="glass-card p-10 text-center">
                <p className="text-[var(--text-muted)] text-sm mb-4">No events yet.</p>
                <button className="btn-outline btn-sm" onClick={() => setShowCreateEvent(true)}>
                  Create Your First Event
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {events.map((event) => {
                  const pendingRsvps = event.rsvps.filter(r => r.status === "pending");
                  const acceptedRsvps = event.rsvps.filter(r => r.status === "confirmed");
                  const attendedRsvps = event.rsvps.filter(r => r.status === "attended");
                  const noShowRsvps = event.rsvps.filter(r => r.status === "no_show");
                  const contentSubmitted = event.rsvps.filter(r => r.contentStatus === "submitted");
                  const contentVerified = event.rsvps.filter(r => r.contentStatus === "verified");
                  const isUpcoming = event.status === "upcoming" || event.status === "open";

                  return (
                    <div key={event.id} className="glass-card-gold rounded-lg overflow-hidden">
                      {/* Event Header */}
                      <div className="p-5 border-b border-[var(--border)]">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-bold text-white">{event.title}</h3>
                              <span className={`badge badge-${event.status}`}>{event.status}</span>
                            </div>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--text-muted)]">
                              <span>{event.venueName}</span>
                              <span>{new Date(event.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</span>
                              <span>{event.time}</span>
                              {event.dressCode && <span>Dress: {event.dressCode}</span>}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {isUpcoming && (
                              <button
                                className="btn-outline btn-sm"
                                style={{ borderColor: "var(--warning)", color: "var(--warning)" }}
                                onClick={() => handleCompleteEvent(event.id)}
                                disabled={actionLoading}
                              >
                                Complete Event
                              </button>
                            )}
                            <div className="text-right">
                              <div className="text-lg font-bold text-[var(--pink)]">
                                {acceptedRsvps.length + attendedRsvps.length} / {event.capacity}
                              </div>
                              <div className="text-[0.55rem] text-[var(--text-muted)] uppercase tracking-wider">Accepted</div>
                            </div>
                          </div>
                        </div>

                        {/* Pipeline Stats */}
                        <div className="flex flex-wrap gap-4 mt-4 pt-3 border-t border-[var(--border)]">
                          <span className="text-[0.55rem] tracking-wider uppercase" style={{ color: "var(--warning)" }}>
                            ● {pendingRsvps.length} pending
                          </span>
                          <span className="text-[0.55rem] tracking-wider uppercase text-[var(--pink)]">
                            ● {acceptedRsvps.length} accepted
                          </span>
                          <span className="text-[0.55rem] tracking-wider uppercase" style={{ color: "var(--success)" }}>
                            ● {attendedRsvps.length} checked in
                          </span>
                          <span className="text-[0.55rem] tracking-wider uppercase text-blue-400">
                            ● {contentSubmitted.length} content submitted
                          </span>
                          <span className="text-[0.55rem] tracking-wider uppercase text-emerald-400">
                            ● {contentVerified.length} verified
                          </span>
                          {noShowRsvps.length > 0 && (
                            <span className="text-[0.55rem] tracking-wider uppercase" style={{ color: "var(--danger)" }}>
                              ● {noShowRsvps.length} no-show
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Full Creator Pipeline Table */}
                      {event.rsvps.length > 0 && (
                        <div className="p-5">
                          <p className="text-[0.6rem] tracking-[0.2em] text-[var(--text-muted)] uppercase mb-3">
                            Creator Pipeline
                          </p>
                          <div className="overflow-x-auto">
                            <table className="data-table w-full">
                              <thead>
                                <tr>
                                  <th>Creator</th>
                                  <th>Instagram</th>
                                  <th>Followers</th>
                                  <th>Status</th>
                                  <th>Check-In</th>
                                  <th>Content</th>
                                  <th>Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {event.rsvps.map((r) => (
                                  <tr key={r.memberId}>
                                    <td className="font-medium text-white">{r.memberName}</td>
                                    <td className="text-[var(--text-secondary)] text-xs">{r.instagram ? `@${r.instagram}` : "—"}</td>
                                    <td className="text-xs">{r.followerCount ? r.followerCount.toLocaleString() : "—"}</td>
                                    <td>
                                      <span className={`badge badge-${r.status}`}>{r.status === "no_show" ? "No Show" : r.status}</span>
                                    </td>
                                    <td>
                                      {r.checkedInAt ? (
                                        <span className="text-[0.55rem] text-[var(--success)]">✓ {new Date(r.checkedInAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                                      ) : r.status === "no_show" ? (
                                        <span className="text-[0.55rem] text-[var(--danger)]">✗ No Show</span>
                                      ) : (
                                        <span className="text-[0.55rem] text-[var(--text-muted)]">—</span>
                                      )}
                                    </td>
                                    <td>
                                      {r.contentStatus === "verified" ? (
                                        <span className="badge badge-active">Verified ✓</span>
                                      ) : r.contentStatus === "submitted" ? (
                                        <div>
                                          <span className="badge badge-pending">Submitted</span>
                                          {r.contentProofs && r.contentProofs.length > 0 && (
                                            <div className="mt-1 space-y-0.5">
                                              {r.contentProofs.map((p, pi) => (
                                                <a key={pi} href={p.link} target="_blank" rel="noopener noreferrer" className="block text-[0.55rem] text-blue-400 hover:underline truncate max-w-[120px]">
                                                  {p.type}: {p.link}
                                                </a>
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                      ) : r.status === "attended" ? (
                                        <span className="text-[0.55rem] text-[var(--text-muted)]">Awaiting</span>
                                      ) : (
                                        <span className="text-[0.55rem] text-[var(--text-muted)]">—</span>
                                      )}
                                    </td>
                                    <td>
                                      <div className="flex gap-1 flex-wrap">
                                        {r.status === "confirmed" && (
                                          <>
                                            <button className="btn-success btn-sm text-[0.5rem]" onClick={async () => {
                                              await fetch(`/api/events/${event.id}/checkin`, {
                                                method: "POST", headers: { ...headers, "Content-Type": "application/json" },
                                                body: JSON.stringify({ memberId: r.memberId, action: "checkin" }),
                                              }); fetchData();
                                            }}>Check In</button>
                                            <button className="btn-danger btn-sm text-[0.5rem]" onClick={async () => {
                                              await fetch(`/api/events/${event.id}/checkin`, {
                                                method: "POST", headers: { ...headers, "Content-Type": "application/json" },
                                                body: JSON.stringify({ memberId: r.memberId, action: "no_show" }),
                                              }); fetchData();
                                            }}>No Show</button>
                                          </>
                                        )}
                                        {r.contentStatus === "submitted" && (
                                          <button className="btn-sm text-[0.5rem] px-2 py-1 bg-blue-500 text-white rounded" onClick={async () => {
                                            await fetch(`/api/events/${event.id}/content`, {
                                              method: "POST", headers: { ...headers, "Content-Type": "application/json" },
                                              body: JSON.stringify({ memberId: r.memberId, verified: true }),
                                            }); fetchData();
                                          }}>Verify Content</button>
                                        )}
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {event.rsvps.length === 0 && (
                        <div className="p-5 text-center">
                          <p className="text-[var(--text-muted)] text-xs italic">No applications yet.</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── VENUES TAB ── */}
        {tab === "venues" && (
          <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h2
                className="text-xl font-light tracking-[0.1em] text-white"

              >
                Venues ({venues.length})
              </h2>
              <button className="btn-gold btn-sm" onClick={() => setShowCreateVenue(true)}>
                Add Venue
              </button>
            </div>

            {/* Pending Venues */}
            {pendingVenues.length > 0 && (
              <div className="mb-8">
                <h3 className="text-[0.65rem] tracking-[0.2em] text-[var(--warning)] uppercase mb-3">
                  Pending Approval ({pendingVenues.length})
                </h3>
                <div className="space-y-3">
                  {pendingVenues.map((v) => (
                    <div key={v.id} className="glass-card-gold p-4 flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium text-white">{v.name}</span>
                        <span className="text-xs text-[var(--text-muted)] ml-3">{v.location}</span>
                        <span className="text-xs text-[var(--text-muted)] ml-3">{v.contactName}</span>
                        {v.instagram && <span className="text-xs text-[var(--text-secondary)] ml-3">@{v.instagram}</span>}
                      </div>
                      <div className="flex gap-2">
                        <button className="btn-success btn-sm" onClick={() => setSelectedVenue(v)}>
                          Review
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {venues.length === 0 && !showCreateVenue ? (
              <div className="glass-card p-10 text-center">
                <p className="text-[var(--text-muted)] text-sm mb-4">No venues yet.</p>
                <button className="btn-outline btn-sm" onClick={() => setShowCreateVenue(true)}>
                  Add Your First Venue
                </button>
              </div>
            ) : venues.filter(v => v.status !== 'pending').length > 0 && (
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Venue</th>
                      <th>Location</th>
                      <th>Contact</th>
                      <th>Instagram</th>
                      <th>Access Code</th>
                      <th>Events</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {venues.filter(v => v.status !== 'pending').map((v) => (
                      <tr key={v.id} onClick={() => setSelectedVenue(v)}>
                        <td className="font-medium">{v.name}</td>
                        <td className="text-[var(--text-secondary)]">{v.location}</td>
                        <td className="text-[var(--text-muted)] text-xs">{v.contactName}</td>
                        <td className="text-[var(--text-secondary)] text-xs">{v.instagram ? `@${v.instagram}` : "—"}</td>
                        <td className="font-mono text-xs text-[var(--pink)]">{v.accessCode}</td>
                        <td>{v.totalEvents}</td>
                        <td><span className={`badge badge-${v.status}`}>{v.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── ANALYTICS TAB ── */}
        {tab === "analytics" && (
          <div className="animate-fade-in">
            <h2
              className="text-xl font-light tracking-[0.1em] text-white mb-6"
            >
              Analytics
            </h2>

            {!analytics ? (
              <div className="glass-card p-10 text-center">
                <p className="text-[var(--text-muted)] text-sm">Loading analytics...</p>
              </div>
            ) : (
              <>
                {/* Overview Cards */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
                  {[
                    { value: `${analytics.attendanceRate}%`, label: "Attendance Rate" },
                    { value: `${analytics.noShowRate}%`, label: "No-Show Rate" },
                    { value: `${analytics.contentRate}%`, label: "Content Rate" },
                    { value: analytics.avgReliabilityScore, label: "Avg Reliability" },
                    { value: analytics.suspendedMembers, label: "Suspended" },
                    { value: analytics.blacklistedMembers, label: "Blacklisted" },
                  ].map((s, i) => (
                    <div key={i} className="stat-card">
                      <div className="stat-value">{s.value}</div>
                      <div className="stat-label">{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Creator Leaderboard */}
                <div className="mb-10">
                  <h3 className="text-[0.65rem] tracking-[0.2em] text-[var(--text-muted)] uppercase mb-4">
                    Creator Leaderboard
                  </h3>
                  {analytics.creatorLeaderboard && analytics.creatorLeaderboard.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Rank</th>
                            <th>Name</th>
                            <th>Instagram</th>
                            <th>Content Score</th>
                            <th>Events Attended</th>
                            <th>Reliability</th>
                            <th>Tier</th>
                          </tr>
                        </thead>
                        <tbody>
                          {analytics.creatorLeaderboard.map((c, i) => (
                            <tr key={i}>
                              <td className="font-bold text-[var(--pink)]">#{c.rank}</td>
                              <td className="font-medium">{c.name}</td>
                              <td className="text-[var(--text-secondary)]">@{c.instagram}</td>
                              <td>{c.contentScore}</td>
                              <td>{c.eventsAttended}</td>
                              <td>{c.reliabilityScore}</td>
                              <td><span className={`badge badge-${c.tier}`}>{tierLabel(c.tier)}</span></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="glass-card p-6 text-center">
                      <p className="text-[var(--text-muted)] text-sm">No creator data available.</p>
                    </div>
                  )}
                </div>

                {/* Venue Performance */}
                <div>
                  <h3 className="text-[0.65rem] tracking-[0.2em] text-[var(--text-muted)] uppercase mb-4">
                    Venue Performance
                  </h3>
                  {analytics.venuePerformance && analytics.venuePerformance.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Venue</th>
                            <th>Total Events</th>
                            <th>Total Creators</th>
                            <th>No-Shows</th>
                            <th>Content Verified</th>
                            <th>Attendance Rate</th>
                          </tr>
                        </thead>
                        <tbody>
                          {analytics.venuePerformance.map((v, i) => (
                            <tr key={i}>
                              <td className="font-medium">{v.venueName}</td>
                              <td>{v.totalEvents}</td>
                              <td>{v.totalCreators}</td>
                              <td>{v.noShows}</td>
                              <td>{v.contentVerified}</td>
                              <td>{v.attendanceRate}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="glass-card p-6 text-center">
                      <p className="text-[var(--text-muted)] text-sm">No venue performance data available.</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* ── APPLICATION REVIEW MODAL ── */}
      {selectedApp && (
        <div className="modal-overlay" onClick={() => { setSelectedApp(null); setAccessCodeResult(""); }}>
          <div className="modal-content p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3
                className="text-lg font-light text-white"

              >
                Application Review
              </h3>
              <button
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                onClick={() => { setSelectedApp(null); setAccessCodeResult(""); }}
              >
                &times;
              </button>
            </div>

            <div className="space-y-3 mb-6">
              {[
                { label: "Name", value: selectedApp.fullName },
                { label: "Instagram", value: `@${selectedApp.instagram}` },
                { label: "Followers", value: selectedApp.followerCount.toLocaleString() },
                { label: "Email", value: selectedApp.email },
                { label: "Phone", value: selectedApp.phone },
                { label: "City", value: selectedApp.city },
                { label: "Why Glow Pass", value: selectedApp.whyJoin || "—" },
                { label: "Referred By", value: selectedApp.referredBy || "—" },
                { label: "Heard From", value: selectedApp.heardFrom || "—" },
                { label: "Status", value: selectedApp.status },
              ].map((item, i) => (
                <div key={i} className="flex justify-between py-2 border-b border-[var(--border)]">
                  <span className="text-[0.6rem] tracking-[0.15em] text-[var(--text-muted)] uppercase">{item.label}</span>
                  <span className="text-sm text-[var(--text-primary)] text-right max-w-[60%]">{item.value}</span>
                </div>
              ))}
            </div>

            {accessCodeResult && (
              <div className="glass-card-gold p-4 mb-6 text-center animate-fade-in">
                <p className="text-[0.6rem] tracking-[0.2em] text-[var(--text-muted)] uppercase mb-2">
                  Member Approved — Access Code
                </p>
                <p className="text-lg font-mono text-[var(--pink)] tracking-[0.3em]">
                  {accessCodeResult}
                </p>
                <p className="text-[var(--text-muted)] text-[0.6rem] mt-2">
                  Send this code to the member via email/WhatsApp
                </p>
              </div>
            )}

            {selectedApp.status === "pending" && !accessCodeResult && (
              <>
                <div className="mb-4">
                  <label className="label-text">Review Note (optional)</label>
                  <textarea
                    className="textarea-field"
                    placeholder="Internal note about this applicant..."
                    value={reviewNote}
                    onChange={(e) => setReviewNote(e.target.value)}
                    rows={2}
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    className="btn-success flex-1"
                    onClick={() => handleApplicationAction(selectedApp.id, "approved")}
                    disabled={actionLoading}
                  >
                    {actionLoading ? "..." : "Approve"}
                  </button>
                  <button
                    className="btn-outline flex-1 btn-sm"
                    onClick={() => handleApplicationAction(selectedApp.id, "waitlisted")}
                    disabled={actionLoading}
                  >
                    Waitlist
                  </button>
                  <button
                    className="btn-danger flex-1"
                    onClick={() => handleApplicationAction(selectedApp.id, "rejected")}
                    disabled={actionLoading}
                  >
                    Reject
                  </button>
                </div>
              </>
            )}

            {accessCodeResult && (
              <button className="btn-gold w-full" onClick={() => { setSelectedApp(null); setAccessCodeResult(""); }}>
                Done
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── CREATE EVENT MODAL ── */}
      {showCreateEvent && (
        <div className="modal-overlay" onClick={() => setShowCreateEvent(false)}>
          <div className="modal-content p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-light text-white">
                Create Event
              </h3>
              <button className="text-[var(--text-muted)] hover:text-[var(--text-primary)]" onClick={() => setShowCreateEvent(false)}>
                &times;
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="label-text">Event Title</label>
                <input className="input-field" placeholder="e.g. Thursday Noir" value={eventForm.title} onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })} />
              </div>
              <div>
                <label className="label-text">Venue Name</label>
                <input className="input-field" placeholder="e.g. Venue Name" value={eventForm.venueName} onChange={(e) => setEventForm({ ...eventForm, venueName: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-text">Date</label>
                  <input type="date" className="input-field" value={eventForm.date} onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })} />
                </div>
                <div>
                  <label className="label-text">Time</label>
                  <input className="input-field" placeholder="10:00 PM" value={eventForm.time} onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-text">Arrival Deadline</label>
                  <input className="input-field" placeholder="10:30 PM" value={eventForm.arrivalDeadline} onChange={(e) => setEventForm({ ...eventForm, arrivalDeadline: e.target.value })} />
                </div>
                <div>
                  <label className="label-text">Capacity</label>
                  <input type="number" className="input-field" value={eventForm.capacity} onChange={(e) => setEventForm({ ...eventForm, capacity: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="label-text">Dress Code</label>
                <input className="input-field" placeholder="All black, elegant" value={eventForm.dressCode} onChange={(e) => setEventForm({ ...eventForm, dressCode: e.target.value })} />
              </div>
              <div>
                <label className="label-text">Description</label>
                <textarea className="textarea-field" placeholder="Event details..." value={eventForm.description} onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })} rows={3} />
              </div>
              <div>
                <label className="label-text">Perks (comma-separated)</label>
                <input className="input-field" placeholder="Free entry, VIP table, 2 drinks" value={eventForm.perks} onChange={(e) => setEventForm({ ...eventForm, perks: e.target.value })} />
              </div>
              <button className="btn-gold w-full" onClick={handleCreateEvent} disabled={actionLoading || !eventForm.title || !eventForm.venueName || !eventForm.date}>
                {actionLoading ? "Creating..." : "Create Event"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── CREATE VENUE MODAL ── */}
      {showCreateVenue && (
        <div className="modal-overlay" onClick={() => setShowCreateVenue(false)}>
          <div className="modal-content p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-light text-white">
                Add Venue
              </h3>
              <button className="text-[var(--text-muted)] hover:text-[var(--text-primary)]" onClick={() => setShowCreateVenue(false)}>
                &times;
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="label-text">Venue Name</label>
                <input className="input-field" placeholder="e.g. Venue Name" value={venueForm.name} onChange={(e) => setVenueForm({ ...venueForm, name: e.target.value })} />
              </div>
              <div>
                <label className="label-text">Location</label>
                <input className="input-field" placeholder="e.g. Dubai Marina" value={venueForm.location} onChange={(e) => setVenueForm({ ...venueForm, location: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-text">Contact Name</label>
                  <input className="input-field" placeholder="Manager name" value={venueForm.contactName} onChange={(e) => setVenueForm({ ...venueForm, contactName: e.target.value })} />
                </div>
                <div>
                  <label className="label-text">Contact Email</label>
                  <input className="input-field" placeholder="venue@email.com" value={venueForm.contactEmail} onChange={(e) => setVenueForm({ ...venueForm, contactEmail: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-text">Contact Phone</label>
                  <input className="input-field" placeholder="+971..." value={venueForm.contactPhone} onChange={(e) => setVenueForm({ ...venueForm, contactPhone: e.target.value })} />
                </div>
                <div>
                  <label className="label-text">Instagram</label>
                  <input className="input-field" placeholder="@venuename" value={venueForm.instagram} onChange={(e) => setVenueForm({ ...venueForm, instagram: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-text">Deal Type</label>
                  <select className="select-field" value={venueForm.dealType} onChange={(e) => setVenueForm({ ...venueForm, dealType: e.target.value })}>
                    <option value="per_head">Per Head</option>
                    <option value="flat_fee">Flat Fee</option>
                    <option value="monthly">Monthly Retainer</option>
                    <option value="commission">Commission</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>
                <div>
                  <label className="label-text">Rate</label>
                  <input className="input-field" placeholder="e.g. $25/head" value={venueForm.rate} onChange={(e) => setVenueForm({ ...venueForm, rate: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="label-text">Notes</label>
                <textarea className="textarea-field" placeholder="Any notes about the partnership..." value={venueForm.notes} onChange={(e) => setVenueForm({ ...venueForm, notes: e.target.value })} rows={2} />
              </div>
              <button className="btn-gold w-full" onClick={handleCreateVenue} disabled={actionLoading || !venueForm.name || !venueForm.location || !venueForm.contactName || !venueForm.contactEmail || !venueForm.contactPhone}>
                {actionLoading ? "Adding..." : "Add Venue"}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ── VENUE REVIEW MODAL ── */}
      {selectedVenue && (
        <div className="modal-overlay" onClick={() => { setSelectedVenue(null); setVenueAccessCodeResult(""); }}>
          <div className="modal-content p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-light text-white">
                Venue Details
              </h3>
              <button className="text-[var(--text-muted)] hover:text-[var(--text-primary)]" onClick={() => { setSelectedVenue(null); setVenueAccessCodeResult(""); }}>
                &times;
              </button>
            </div>

            <div className="space-y-3 mb-6">
              {[
                { label: "Venue Name", value: selectedVenue.name },
                { label: "Location", value: selectedVenue.location },
                { label: "Type", value: selectedVenue.venueType || "—" },
                { label: "Capacity", value: selectedVenue.capacity ? selectedVenue.capacity.toString() : "—" },
                { label: "Instagram", value: selectedVenue.instagram ? `@${selectedVenue.instagram}` : "—" },
                { label: "Contact", value: selectedVenue.contactName },
                { label: "Email", value: selectedVenue.contactEmail || "—" },
                { label: "Phone", value: selectedVenue.contactPhone },
                { label: "Description", value: selectedVenue.description || "—" },
                { label: "Status", value: selectedVenue.status },
              ].map((item, i) => (
                <div key={i} className="flex justify-between py-2 border-b border-[var(--border)]">
                  <span className="text-[0.6rem] tracking-[0.15em] text-[var(--text-muted)] uppercase">{item.label}</span>
                  <span className="text-sm text-[var(--text-primary)] text-right max-w-[60%]">{item.value}</span>
                </div>
              ))}
            </div>

            {venueAccessCodeResult && (
              <div className="glass-card-gold p-4 mb-6 text-center animate-fade-in">
                <p className="text-[0.6rem] tracking-[0.2em] text-[var(--text-muted)] uppercase mb-2">
                  Venue Approved — Access Code
                </p>
                <p className="text-lg font-mono text-[var(--pink)] tracking-[0.3em]">
                  {venueAccessCodeResult}
                </p>
                <p className="text-[var(--text-muted)] text-[0.6rem] mt-2">
                  Send this code to the venue manager
                </p>
              </div>
            )}

            {selectedVenue.status === "pending" && !venueAccessCodeResult && (
              <div className="flex gap-3">
                <button
                  className="btn-success flex-1"
                  onClick={() => handleVenueAction(selectedVenue.id, "active")}
                  disabled={actionLoading}
                >
                  {actionLoading ? "..." : "Approve Venue"}
                </button>
                <button
                  className="btn-danger flex-1"
                  onClick={() => handleVenueAction(selectedVenue.id, "inactive")}
                  disabled={actionLoading}
                >
                  Reject
                </button>
              </div>
            )}

            {selectedVenue.status === "active" && !venueAccessCodeResult && (
              <div className="glass-card p-3 text-center">
                <p className="text-[0.6rem] text-[var(--text-muted)]">
                  Access Code: <span className="font-mono text-[var(--pink)]">{selectedVenue.accessCode}</span>
                </p>
              </div>
            )}

            {venueAccessCodeResult && (
              <button className="btn-gold w-full" onClick={() => { setSelectedVenue(null); setVenueAccessCodeResult(""); }}>
                Done
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

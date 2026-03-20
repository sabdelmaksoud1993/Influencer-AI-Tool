"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";

interface MemberData {
  id: string;
  fullName: string;
  instagram: string;
  followerCount: number;
  accessCode: string;
  tier: string;
  status: string;
  eventsAttended: number;
  contentScore: number;
  joinedAt: string;
  strikes: number;
  noShows: number;
  reliabilityScore: number;
  totalEventsApplied: number;
}

interface EventData {
  id: string;
  title: string;
  venueName: string;
  date: string;
  time: string;
  arrivalDeadline: string;
  dressCode: string;
  description: string;
  perks: string[];
  capacity: number;
  spotsLeft: number;
  myRsvp: string | null;
  myContentStatus?: string;
  checkInToken?: string;
}

interface ContentLink {
  link: string;
  type: "Story" | "Post" | "Reel";
}

export default function MemberPage() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [member, setMember] = useState<MemberData | null>(null);
  const [events, setEvents] = useState<EventData[]>([]);
  const [applyingTo, setApplyingTo] = useState<string | null>(null);
  const [contentForms, setContentForms] = useState<Record<string, ContentLink[]>>({});
  const [expandedContent, setExpandedContent] = useState<Record<string, boolean>>({});
  const [submittingContent, setSubmittingContent] = useState<string | null>(null);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.accessCode) {
      fetchMemberData(session.user.accessCode as string);
    }
  }, [status, session]);

  const fetchMemberData = async (accessCode: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/members/${accessCode}`);
      if (!res.ok) throw new Error("Failed to load data");
      const data = await res.json();
      setMember(data.member);
      setEvents(data.upcomingEvents || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (eventId: string) => {
    if (!member) return;
    setApplyingTo(eventId);
    setError("");

    try {
      const res = await fetch(`/api/events/${eventId}/rsvp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessCode: member.accessCode, status: "pending" }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }

      // Refresh
      const memberRes = await fetch(`/api/members/${member.accessCode}`);
      const memberData = await memberRes.json();
      setEvents(memberData.upcomingEvents || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to apply");
    } finally {
      setApplyingTo(null);
    }
  };

  const handleWithdraw = async (eventId: string) => {
    if (!member) return;
    setApplyingTo(eventId);
    setError("");

    try {
      const res = await fetch(`/api/events/${eventId}/rsvp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessCode: member.accessCode, status: "declined" }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }

      const memberRes = await fetch(`/api/members/${member.accessCode}`);
      const memberData = await memberRes.json();
      setEvents(memberData.upcomingEvents || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to withdraw");
    } finally {
      setApplyingTo(null);
    }
  };

  const getContentLinks = (eventId: string): ContentLink[] => {
    return contentForms[eventId] || [{ link: "", type: "Post" }];
  };

  const updateContentLink = (eventId: string, index: number, field: keyof ContentLink, value: string) => {
    const links = [...getContentLinks(eventId)];
    links[index] = { ...links[index], [field]: value };
    setContentForms((prev) => ({ ...prev, [eventId]: links }));
  };

  const addContentLink = (eventId: string) => {
    const links = [...getContentLinks(eventId), { link: "", type: "Post" as const }];
    setContentForms((prev) => ({ ...prev, [eventId]: links }));
  };

  const removeContentLink = (eventId: string, index: number) => {
    const links = getContentLinks(eventId).filter((_, i) => i !== index);
    if (links.length === 0) links.push({ link: "", type: "Post" });
    setContentForms((prev) => ({ ...prev, [eventId]: links }));
  };

  const handleSubmitContent = async (eventId: string) => {
    if (!member) return;
    const links = getContentLinks(eventId);
    const validLinks = links.filter((l) => l.link.trim() !== "");
    if (validLinks.length === 0) {
      setError("Please add at least one link");
      return;
    }

    setSubmittingContent(eventId);
    setError("");

    try {
      const res = await fetch(`/api/events/${eventId}/content`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessCode: member.accessCode, links: validLinks }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit content");
      }

      // Refresh member data
      const memberRes = await fetch(`/api/members/${member.accessCode}`);
      const memberData = await memberRes.json();
      setMember(memberData.member);
      setEvents(memberData.upcomingEvents || []);
      setContentForms((prev) => {
        const next = { ...prev };
        delete next[eventId];
        return next;
      });
      setExpandedContent((prev) => ({ ...prev, [eventId]: false }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to submit content");
    } finally {
      setSubmittingContent(null);
    }
  };

  const tierProgress = member
    ? member.tier === "muse" ? 100
    : member.tier === "inner_circle" ? 66
    : 33
    : 0;

  const tierLabel = (t: string) =>
    t === "inner_circle" ? "Inner Circle" : t === "muse" ? "Muse" : "Creator";

  const getRsvpDisplay = (event: EventData): { label: string; color: string; bg: string } | null => {
    const status = event.myRsvp;
    if (!status) return null;

    switch (status) {
      case "pending":
        return { label: "Applied \u2014 Awaiting Venue Approval", color: "var(--warning)", bg: "rgba(251,191,36,0.08)" };
      case "confirmed":
        return { label: "Accepted \u2713 \u2014 Waiting for Event", color: "var(--success)", bg: "rgba(74,222,128,0.08)" };
      case "declined":
        return { label: "Not Selected", color: "var(--text-muted)", bg: "rgba(255,255,255,0.03)" };
      case "no_show":
        return { label: "Marked as No Show \u2014 Strike Added", color: "var(--danger)", bg: "rgba(248,113,113,0.08)" };
      case "attended": {
        const cs = event.myContentStatus;
        if (cs === "verified") {
          return { label: "Content Verified \u2713", color: "var(--success)", bg: "rgba(74,222,128,0.08)" };
        }
        if (cs === "submitted") {
          return { label: "Content Submitted \u2014 Under Review", color: "var(--warning)", bg: "rgba(251,191,36,0.08)" };
        }
        // not_submitted or undefined — show form trigger
        return { label: "Attended \u2014 Submit Your Content", color: "var(--pink)", bg: "rgba(236,72,153,0.08)" };
      }
      default:
        return null;
    }
  };

  if (!member) {
    return (
      <div className="min-h-screen hero-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[var(--pink)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[var(--text-muted)] text-xs tracking-widest uppercase">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Creator dashboard
  return (
    <div className="min-h-screen hero-bg">
      {/* Header */}
      <nav className="flex items-center justify-between px-8 py-6 border-b border-[var(--border)]">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 border border-[var(--border-gold)] flex items-center justify-center">
            <div className="w-3 h-3 gold-gradient rotate-45" />
          </div>
          <span className="text-xs tracking-[0.3em] text-[var(--text-secondary)] uppercase">
            Glow Pass
          </span>
        </Link>
        <button
          className="text-[0.65rem] tracking-[0.2em] text-[var(--text-muted)] uppercase hover:text-[var(--pink)] transition-colors"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          Sign Out
        </button>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Welcome */}
        <div className="mb-10 animate-fade-in">
          <p className="text-[0.6rem] tracking-[0.3em] text-[var(--text-muted)] uppercase mb-2">
            Welcome back
          </p>
          <h1 className="text-3xl font-light tracking-[0.1em] text-white">
            {member.fullName}
          </h1>
        </div>

        {/* Status Banners */}
        {member.status === "suspended" && (
          <div className="p-5 border border-[var(--danger)] bg-[rgba(248,113,113,0.08)] mb-6 animate-fade-in">
            <p className="text-[var(--danger)] text-sm font-medium mb-1">
              Account Suspended
            </p>
            <p className="text-[var(--danger)] text-xs opacity-80">
              Your account has been suspended due to repeated violations. You cannot apply to events at this time. Please contact support for more information.
            </p>
          </div>
        )}

        {member.status === "blacklisted" && (
          <div className="p-5 border border-[var(--danger)] bg-[rgba(248,113,113,0.08)] mb-6 animate-fade-in">
            <p className="text-[var(--danger)] text-sm font-medium mb-1">
              Account Blacklisted
            </p>
            <p className="text-[var(--danger)] text-xs opacity-80">
              Your account has been permanently blacklisted. You are no longer eligible to participate in Glow Pass events.
            </p>
          </div>
        )}

        {member.strikes > 0 && member.status !== "suspended" && member.status !== "blacklisted" && (
          <div className="p-4 border border-[var(--warning)] bg-[rgba(251,191,36,0.08)] mb-6 animate-fade-in">
            <p className="text-[var(--warning)] text-xs">
              {"\u26A0"} You have {member.strikes} strike{member.strikes !== 1 ? "s" : ""}. 3 strikes = account suspension.
            </p>
          </div>
        )}

        {/* Creator Card */}
        <div className="glass-card-gold p-6 mb-8 animate-fade-in-up">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 border border-[var(--border-gold)] flex items-center justify-center gold-glow">
                <span className="text-xl text-[var(--pink)]">
                  {member.fullName.charAt(0)}
                </span>
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-sm text-white">
                    @{member.instagram}
                  </span>
                  <span className={`badge badge-${member.tier}`}>
                    {tierLabel(member.tier)}
                  </span>
                </div>
                <p className="text-[var(--text-muted)] text-xs">
                  Creator since {new Date(member.joinedAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="text-center">
                <div className="text-xl text-[var(--pink)]">
                  {member.eventsAttended}
                </div>
                <div className="text-[0.55rem] tracking-[0.15em] text-[var(--text-muted)] uppercase">
                  Events
                </div>
              </div>
              <div className="w-[1px] bg-[var(--border)]" />
              <div className="text-center">
                <div className="text-xl text-[var(--pink)]">
                  {member.contentScore}
                </div>
                <div className="text-[0.55rem] tracking-[0.15em] text-[var(--text-muted)] uppercase">
                  Content Score
                </div>
              </div>
              <div className="w-[1px] bg-[var(--border)]" />
              <div className="text-center">
                <div className="text-xl text-[var(--pink)]">
                  {member.followerCount.toLocaleString()}
                </div>
                <div className="text-[0.55rem] tracking-[0.15em] text-[var(--text-muted)] uppercase">
                  Followers
                </div>
              </div>
              <div className="w-[1px] bg-[var(--border)]" />
              <div className="text-center">
                <div className={`text-xl ${member.reliabilityScore >= 70 ? "text-[var(--pink)]" : member.reliabilityScore >= 40 ? "text-[var(--warning)]" : "text-[var(--danger)]"}`}>
                  {member.reliabilityScore}
                </div>
                <div className="text-[0.55rem] tracking-[0.15em] text-[var(--text-muted)] uppercase">
                  Reliability
                </div>
              </div>
            </div>
          </div>

          {/* Tier progress */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[0.55rem] tracking-[0.15em] text-[var(--text-muted)] uppercase">
                Tier Progress
              </span>
              <span className="text-[0.55rem] tracking-[0.15em] text-[var(--pink)] uppercase">
                {tierLabel(member.tier)}
              </span>
            </div>
            <div className="tier-bar">
              <div className="tier-bar-fill" style={{ width: `${tierProgress}%` }} />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[0.5rem] text-[var(--text-muted)]">Creator</span>
              <span className="text-[0.5rem] text-[var(--text-muted)]">Inner Circle</span>
              <span className="text-[0.5rem] text-[var(--text-muted)]">Muse</span>
            </div>
          </div>
        </div>

        {/* Access Code */}
        <div className="glass-card p-4 mb-8 flex items-center justify-between">
          <div>
            <p className="text-[0.55rem] tracking-[0.15em] text-[var(--text-muted)] uppercase">
              Your Access Code
            </p>
            <p className="text-sm text-[var(--pink)] tracking-[0.2em] font-mono mt-1">
              {member.accessCode}
            </p>
          </div>
          <p className="text-[var(--text-muted)] text-[0.6rem]">
            Keep this private
          </p>
        </div>

        {/* Available Events */}
        <div className="mb-6">
          <h2 className="text-lg font-light tracking-[0.1em] text-white mb-1">
            Available Events
          </h2>
          <p className="text-[var(--text-muted)] text-xs mb-6">
            Apply to events you want to attend. Venues will review your profile.
          </p>
        </div>

        {error && (
          <div className="p-3 border border-[var(--danger)] bg-[rgba(248,113,113,0.05)] mb-4 animate-fade-in">
            <p className="text-[var(--danger)] text-xs">{error}</p>
          </div>
        )}

        {events.length === 0 ? (
          <div className="glass-card p-10 text-center">
            <p className="text-[var(--text-muted)] text-sm mb-2">
              No events available right now.
            </p>
            <p className="text-[var(--text-muted)] text-xs">
              New events are posted regularly. Check back soon.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((event) => {
              const rsvpStatus = event.myRsvp;
              const config = getRsvpDisplay(event);
              const showContentForm =
                rsvpStatus === "attended" &&
                event.myContentStatus !== "submitted" &&
                event.myContentStatus !== "verified";
              const isContentExpanded = expandedContent[event.id] || false;
              const contentLinks = getContentLinks(event.id);

              return (
                <div key={event.id} className="event-card animate-fade-in-up">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-light text-white">
                          {event.title}
                        </h3>
                      </div>

                      <div className="flex flex-wrap gap-x-6 gap-y-1 mb-3">
                        <span className="text-xs text-[var(--text-secondary)]">
                          {event.venueName}
                        </span>
                        <span className="text-xs text-[var(--text-muted)]">
                          {new Date(event.date).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
                        </span>
                        <span className="text-xs text-[var(--text-muted)]">
                          {event.time}
                        </span>
                      </div>

                      {event.description && (
                        <p className="text-xs text-[var(--text-muted)] mb-3 leading-relaxed">
                          {event.description}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-3 mb-3">
                        {event.arrivalDeadline && (
                          <div className="flex items-center gap-1.5">
                            <span className="text-[0.55rem] tracking-[0.1em] text-[var(--warning)] uppercase">
                              Arrive by: {event.arrivalDeadline}
                            </span>
                          </div>
                        )}
                        {event.dressCode && (
                          <div className="flex items-center gap-1.5">
                            <span className="text-[0.55rem] tracking-[0.1em] text-[var(--text-muted)] uppercase">
                              Dress: {event.dressCode}
                            </span>
                          </div>
                        )}
                      </div>

                      {event.perks.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {event.perks.map((perk, i) => (
                            <span key={i} className="badge badge-gold">
                              {perk}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-3">
                      <div className="text-right">
                        <span className="text-[0.55rem] tracking-[0.1em] text-[var(--text-muted)] uppercase">
                          {event.spotsLeft} / {event.capacity} spots left
                        </span>
                      </div>

                      {/* Application status or Apply button */}
                      {config ? (
                        <div
                          className="px-4 py-2.5 rounded-lg text-center min-w-[180px]"
                          style={{ background: config.bg, border: `1px solid ${config.color}20` }}
                        >
                          <span className="text-xs font-medium" style={{ color: config.color }}>
                            {config.label}
                          </span>
                          {rsvpStatus === "pending" && (
                            <button
                              className="block mt-2 text-[0.55rem] tracking-wider text-[var(--text-muted)] hover:text-[var(--danger)] transition-colors uppercase mx-auto"
                              onClick={() => handleWithdraw(event.id)}
                              disabled={applyingTo === event.id}
                            >
                              Withdraw Application
                            </button>
                          )}
                          {showContentForm && (
                            <button
                              className="block mt-2 text-[0.55rem] tracking-wider text-[var(--pink)] hover:text-white transition-colors uppercase mx-auto"
                              onClick={() =>
                                setExpandedContent((prev) => ({
                                  ...prev,
                                  [event.id]: !prev[event.id],
                                }))
                              }
                            >
                              {isContentExpanded ? "Close" : "Submit Content"}
                            </button>
                          )}
                        </div>
                      ) : (
                        <button
                          className="btn-gold min-w-[140px]"
                          onClick={() => handleApply(event.id)}
                          disabled={applyingTo === event.id || event.spotsLeft <= 0 || member.status === "suspended" || member.status === "blacklisted"}
                        >
                          {applyingTo === event.id ? "Applying..." : member.status === "suspended" || member.status === "blacklisted" ? "Unavailable" : event.spotsLeft <= 0 ? "Full" : "Apply to Join"}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Check-In QR for confirmed RSVPs */}
                  {rsvpStatus === "confirmed" && event.checkInToken && (
                    <div className="mt-4 pt-4 border-t border-[var(--border)] animate-fade-in">
                      <div className="glass-card p-6 flex flex-col items-center text-center">
                        <p className="text-[0.55rem] tracking-[0.2em] text-[var(--text-muted)] uppercase mb-4">
                          Your Check-In QR
                        </p>
                        <div className="p-4 rounded-xl bg-white mb-4">
                          <QRCodeSVG
                            value={event.checkInToken}
                            size={180}
                            bgColor="#ffffff"
                            fgColor="#000000"
                            level="H"
                            marginSize={2}
                          />
                        </div>
                        <p className="text-xs text-[var(--text-muted)] font-mono tracking-[0.15em] mb-2">
                          Code: {event.checkInToken}
                        </p>
                        <p className="text-[0.6rem] text-[var(--text-muted)]">
                          Show this QR code at the venue door
                        </p>
                      </div>
                    </div>
                  )}

                  {/* No-Show Badge */}
                  {rsvpStatus === "no_show" && (
                    <div className="mt-4 pt-4 border-t border-[var(--border)] animate-fade-in">
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[rgba(248,113,113,0.1)] border border-[var(--danger)]">
                        <span className="text-[var(--danger)] text-xs font-medium">
                          No Show — Strike Added
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Content Submission Form */}
                  {showContentForm && isContentExpanded && (
                    <div className="mt-5 pt-5 border-t border-[var(--border)] animate-fade-in">
                      <h4 className="text-sm font-light tracking-[0.1em] text-white mb-4">
                        Submit Your Content
                      </h4>
                      <p className="text-[var(--text-muted)] text-xs mb-4">
                        Add links to the Instagram content you posted for this event.
                      </p>

                      <div className="space-y-3">
                        {contentLinks.map((cl, index) => (
                          <div key={index} className="flex gap-2 items-start">
                            <input
                              type="text"
                              className="input-field flex-1"
                              placeholder="https://instagram.com/p/..."
                              value={cl.link}
                              onChange={(e) =>
                                updateContentLink(event.id, index, "link", e.target.value)
                              }
                            />
                            <select
                              className="input-field w-24"
                              value={cl.type}
                              onChange={(e) =>
                                updateContentLink(event.id, index, "type", e.target.value)
                              }
                            >
                              <option value="Story">Story</option>
                              <option value="Post">Post</option>
                              <option value="Reel">Reel</option>
                            </select>
                            <button
                              className="text-[var(--text-muted)] hover:text-[var(--danger)] transition-colors px-2 py-2 text-sm"
                              onClick={() => removeContentLink(event.id, index)}
                              title="Remove link"
                            >
                              &times;
                            </button>
                          </div>
                        ))}
                      </div>

                      <button
                        className="text-[0.6rem] tracking-[0.15em] text-[var(--pink)] hover:text-white transition-colors uppercase mt-3"
                        onClick={() => addContentLink(event.id)}
                      >
                        + Add Another Link
                      </button>

                      <div className="mt-4">
                        <button
                          className="btn-gold"
                          onClick={() => handleSubmitContent(event.id)}
                          disabled={submittingContent === event.id}
                        >
                          {submittingContent === event.id
                            ? "Submitting..."
                            : "Submit Content"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

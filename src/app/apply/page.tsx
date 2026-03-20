"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

function ApplyContent() {
  const searchParams = useSearchParams();
  const initialRole = searchParams.get("role") === "venue" ? "venue" : null;

  const [role, setRole] = useState<"member" | "venue" | null>(initialRole);
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  // Member form
  const [memberForm, setMemberForm] = useState({
    fullName: "",
    instagram: "",
    followerCount: "",
    email: "",
    phone: "",
    city: "",
    whyJoin: "",
    referredBy: "",
    heardFrom: "",
  });

  // Venue form
  const [venueForm, setVenueForm] = useState({
    name: "",
    location: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    instagram: "",
    description: "",
    venueType: "",
    capacity: "",
  });

  useEffect(() => {
    if (initialRole === "venue") setRole("venue");
  }, [initialRole]);

  const updateMember = (field: string, value: string) => {
    setMemberForm((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  const updateVenue = (field: string, value: string) => {
    setVenueForm((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  const validateMemberStep1 = () => {
    if (!memberForm.fullName.trim()) return "Full name is required";
    if (!memberForm.instagram.trim()) return "Instagram handle is required";
    if (!memberForm.email.trim()) return "Email is required";
    if (!memberForm.phone.trim()) return "Phone number is required";
    if (!memberForm.city.trim()) return "City is required";
    return null;
  };

  const validateVenueStep1 = () => {
    if (!venueForm.name.trim()) return "Venue name is required";
    if (!venueForm.location.trim()) return "Location is required";
    if (!venueForm.contactName.trim()) return "Contact name is required";
    if (!venueForm.contactEmail.trim()) return "Email is required";
    if (!venueForm.contactPhone.trim()) return "Phone is required";
    return null;
  };

  const nextStep = () => {
    if (step === 1) {
      const err = role === "member" ? validateMemberStep1() : validateVenueStep1();
      if (err) {
        setError(err);
        return;
      }
    }
    setStep(step + 1);
  };

  const handleSubmitMember = async () => {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...memberForm,
          followerCount: parseInt(memberForm.followerCount) || 0,
          photos: [],
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Something went wrong");
      }
      setSubmitted(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to submit");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitVenue = async () => {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/venues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...venueForm,
          capacity: parseInt(venueForm.capacity) || 0,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Something went wrong");
      }
      setSubmitted(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to submit");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Success Screen ──
  if (submitted) {
    return (
      <div className="min-h-screen hero-bg flex items-center justify-center px-6">
        <div className="max-w-md text-center animate-fade-in-up">
          <div className="w-16 h-16 border border-[var(--border-gold)] mx-auto mb-8 flex items-center justify-center animate-pulse-glow">
            <div className="w-6 h-6 gold-gradient rotate-45" />
          </div>

          <h1
            className="text-3xl font-light tracking-[0.15em] text-white mb-4"
            style={{ fontFamily: "sans-serif", fontWeight: "bold" }}
          >
            {role === "member" ? "Application Received" : "Registration Received"}
          </h1>

          <div className="divider-gold mx-auto mb-6 w-12" />

          {role === "member" ? (
            <>
              <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-3">
                Thank you for your interest in Glow Pass. Your application is now under
                review by our curation team.
              </p>
              <p className="text-[var(--text-muted)] text-xs leading-relaxed mb-10">
                You will receive a response within 48 hours. If selected, your
                membership details and access code will be sent to your email.
              </p>
              <div className="glass-card-gold p-5 mb-10">
                <p className="text-[0.6rem] tracking-[0.2em] text-[var(--text-muted)] uppercase mb-2">
                  What happens next
                </p>
                <div className="space-y-3 text-left">
                  {[
                    "Our team reviews your profile within 48 hours",
                    "If accepted, you receive a unique access code",
                    "Your first event invitation arrives via email",
                    "Show up, shine, and become part of the circle",
                  ].map((item, i) => (
                    <div key={i} className="flex gap-3 items-start">
                      <span className="text-[var(--pink)] text-xs mt-0.5">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="text-[var(--text-secondary)] text-xs">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-3">
                Thank you for registering your venue with Glow Pass. Our partnerships
                team will review your submission.
              </p>
              <p className="text-[var(--text-muted)] text-xs leading-relaxed mb-10">
                Once approved, you will receive a venue access code to manage your
                events, track RSVPs, and monitor content performance.
              </p>
              <div className="glass-card-gold p-5 mb-10">
                <p className="text-[0.6rem] tracking-[0.2em] text-[var(--text-muted)] uppercase mb-2">
                  What happens next
                </p>
                <div className="space-y-3 text-left">
                  {[
                    "Our partnerships team reviews your venue",
                    "If approved, you receive a venue access code",
                    "Access your venue dashboard to view events",
                    "Track RSVPs, attendance, and content in real-time",
                  ].map((item, i) => (
                    <div key={i} className="flex gap-3 items-start">
                      <span className="text-[var(--pink)] text-xs mt-0.5">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="text-[var(--text-secondary)] text-xs">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          <Link href="/" className="btn-outline">
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  // ── Role Selection ──
  if (!role) {
    return (
      <div className="min-h-screen hero-bg">
        <nav className="flex items-center justify-between px-8 py-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 border border-[var(--border-gold)] flex items-center justify-center">
              <div className="w-3 h-3 gold-gradient rotate-45" />
            </div>
            <span className="text-xs tracking-[0.3em] text-[var(--text-secondary)] uppercase" style={{ fontFamily: "sans-serif", fontWeight: "bold" }}>
              Glow Pass
            </span>
          </Link>
        </nav>

        <div className="max-w-2xl mx-auto px-6 py-20">
          <div className="text-center mb-14 animate-fade-in">
            <p className="text-[0.6rem] tracking-[0.4em] text-[var(--text-muted)] uppercase mb-4">
              Join Glow Pass
            </p>
            <h1
              className="text-3xl font-light tracking-[0.15em] text-white mb-3"
              style={{ fontFamily: "sans-serif", fontWeight: "bold" }}
            >
              How Would You Like to Join?
            </h1>
            <div className="divider-gold mx-auto w-12" />
          </div>

          <div className="grid md:grid-cols-2 gap-6 animate-fade-in-up">
            {/* Member Card */}
            <button
              onClick={() => setRole("member")}
              className="glass-card-gold p-8 text-left hover:border-[var(--gold)] transition-all duration-300 group cursor-pointer"
            >
              <div className="w-12 h-12 border border-[var(--border-gold)] flex items-center justify-center mb-6 group-hover:gold-glow transition-all">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-[var(--pink)]">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <h3
                className="text-xl font-light text-white mb-2 tracking-wide"
                style={{ fontFamily: "sans-serif", fontWeight: "bold" }}
              >
                I&apos;m a Creator
              </h3>
              <p className="text-[var(--text-muted)] text-xs leading-relaxed mb-4">
                Apply to join the circle as an influencer or socialite. Get access to
                exclusive guestlists, VIP tables, and complimentary perks at top venues.
              </p>
              <div className="flex flex-wrap gap-2">
                {["Free Entry", "VIP Access", "Brand Perks"].map((p) => (
                  <span key={p} className="badge badge-gold">{p}</span>
                ))}
              </div>
              <div className="mt-6 text-[0.65rem] tracking-[0.15em] text-[var(--pink)] uppercase group-hover:translate-x-1 transition-transform">
                Apply Now &rarr;
              </div>
            </button>

            {/* Venue Card */}
            <button
              onClick={() => setRole("venue")}
              className="glass-card-gold p-8 text-left hover:border-[var(--gold)] transition-all duration-300 group cursor-pointer"
            >
              <div className="w-12 h-12 border border-[var(--border-gold)] flex items-center justify-center mb-6 group-hover:gold-glow transition-all">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-[var(--pink)]">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </div>
              <h3
                className="text-xl font-light text-white mb-2 tracking-wide"
                style={{ fontFamily: "sans-serif", fontWeight: "bold" }}
              >
                I&apos;m a Venue
              </h3>
              <p className="text-[var(--text-muted)] text-xs leading-relaxed mb-4">
                Register your venue to receive curated crowds, organic social media
                content, and elevated atmosphere every week.
              </p>
              <div className="flex flex-wrap gap-2">
                {["Early Crowd", "Content", "Aesthetics"].map((p) => (
                  <span key={p} className="badge badge-gold">{p}</span>
                ))}
              </div>
              <div className="mt-6 text-[0.65rem] tracking-[0.15em] text-[var(--pink)] uppercase group-hover:translate-x-1 transition-transform">
                Register Venue &rarr;
              </div>
            </button>
          </div>

          <div className="text-center mt-10">
            <p className="text-[var(--text-muted)] text-[0.6rem]">
              Already have access?{" "}
              <Link href="/member" className="text-[var(--pink)] hover:text-[var(--pink-light)]">Creator login</Link>
              {" "}&middot;{" "}
              <Link href="/venue" className="text-[var(--pink)] hover:text-[var(--pink-light)]">Venue login</Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  const totalSteps = role === "member" ? 3 : 2;

  // ── Main Form ──
  return (
    <div className="min-h-screen hero-bg">
      {/* Header */}
      <nav className="flex items-center justify-between px-8 py-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 border border-[var(--border-gold)] flex items-center justify-center">
            <div className="w-3 h-3 gold-gradient rotate-45" />
          </div>
          <span className="text-xs tracking-[0.3em] text-[var(--text-secondary)] uppercase" style={{ fontFamily: "sans-serif", fontWeight: "bold" }}>
            Glow Pass
          </span>
        </Link>
        <button
          onClick={() => { setRole(null); setStep(1); setError(""); }}
          className="text-[0.65rem] tracking-[0.15em] text-[var(--text-muted)] uppercase hover:text-[var(--pink)] transition-colors"
        >
          Switch Role
        </button>
      </nav>

      <div className="max-w-lg mx-auto px-6 py-12">
        {/* Title */}
        <div className="text-center mb-12 animate-fade-in">
          <p className="text-[0.6rem] tracking-[0.4em] text-[var(--text-muted)] uppercase mb-4">
            {role === "member" ? "Creator Application" : "Venue Registration"}
          </p>
          <h1
            className="text-3xl font-light tracking-[0.15em] text-white mb-3"
            style={{ fontFamily: "sans-serif", fontWeight: "bold" }}
          >
            {role === "member" ? "Request Membership" : "Register Your Venue"}
          </h1>
          <div className="divider-gold mx-auto mb-4 w-12" />
          <p className="text-[var(--text-muted)] text-xs">
            {role === "member"
              ? "Not everyone will be accepted. This is by design."
              : "Partner with us to elevate your venue's nightlife."}
          </p>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {Array.from({ length: totalSteps }, (_, i) => i + 1).map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 flex items-center justify-center text-xs transition-all duration-300 ${
                  s === step
                    ? "border border-[var(--gold)] text-[var(--pink)]"
                    : s < step
                    ? "bg-[var(--gold)] text-[var(--bg-primary)]"
                    : "border border-[var(--border)] text-[var(--text-muted)]"
                }`}
              >
                {s < step ? "✓" : s}
              </div>
              {s < totalSteps && (
                <div className={`w-12 h-[1px] ${s < step ? "bg-[var(--gold)]" : "bg-[var(--border)]"}`} />
              )}
            </div>
          ))}
        </div>

        {/* ═══ MEMBER FORM ═══ */}
        {role === "member" && (
          <>
            {step === 1 && (
              <div className="space-y-5 animate-fade-in-up">
                <div>
                  <label className="label-text">Full Name</label>
                  <input type="text" className="input-field" placeholder="Your full name" value={memberForm.fullName} onChange={(e) => updateMember("fullName", e.target.value)} />
                </div>
                <div>
                  <label className="label-text">Instagram Handle</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-sm">@</span>
                    <input type="text" className="input-field pl-7" placeholder="yourusername" value={memberForm.instagram} onChange={(e) => updateMember("instagram", e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className="label-text">Follower Count (approx)</label>
                  <input type="text" className="input-field" placeholder="e.g. 5000" value={memberForm.followerCount} onChange={(e) => updateMember("followerCount", e.target.value)} />
                </div>
                <div>
                  <label className="label-text">Email</label>
                  <input type="email" className="input-field" placeholder="your@email.com" value={memberForm.email} onChange={(e) => updateMember("email", e.target.value)} />
                </div>
                <div>
                  <label className="label-text">Phone (WhatsApp)</label>
                  <input type="tel" className="input-field" placeholder="+971 50 123 4567" value={memberForm.phone} onChange={(e) => updateMember("phone", e.target.value)} />
                </div>
                <div>
                  <label className="label-text">City</label>
                  <select className="select-field" value={memberForm.city} onChange={(e) => updateMember("city", e.target.value)}>
                    <option value="">Select your city</option>
                    <option value="Dubai">Dubai</option>
                    <option value="Abu Dhabi">Abu Dhabi</option>
                    <option value="Riyadh">Riyadh</option>
                    <option value="Doha">Doha</option>
                    <option value="Cairo">Cairo</option>
                    <option value="London">London</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5 animate-fade-in-up">
                <div>
                  <label className="label-text">Why should you be part of Glow Pass?</label>
                  <textarea className="textarea-field" placeholder="In 1-2 sentences, tell us what you bring to the table..." value={memberForm.whyJoin} onChange={(e) => updateMember("whyJoin", e.target.value)} rows={4} />
                  <p className="text-[var(--text-muted)] text-[0.6rem] mt-1.5">Be authentic. We value confidence over résumés.</p>
                </div>
                <div>
                  <label className="label-text">How did you hear about us?</label>
                  <select className="select-field" value={memberForm.heardFrom} onChange={(e) => updateMember("heardFrom", e.target.value)}>
                    <option value="">Select one</option>
                    <option value="instagram">Instagram</option>
                    <option value="friend">A friend / member</option>
                    <option value="event">Saw us at an event</option>
                    <option value="tiktok">TikTok</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="label-text">Referred by (if applicable)</label>
                  <input type="text" className="input-field" placeholder="Name or Instagram of who referred you" value={memberForm.referredBy} onChange={(e) => updateMember("referredBy", e.target.value)} />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="animate-fade-in-up">
                <div className="glass-card-gold p-6 space-y-4">
                  <p className="text-[0.6rem] tracking-[0.2em] text-[var(--text-muted)] uppercase mb-4">Review Your Application</p>
                  {[
                    { label: "Name", value: memberForm.fullName },
                    { label: "Instagram", value: `@${memberForm.instagram.replace("@", "")}` },
                    { label: "Followers", value: memberForm.followerCount || "Not specified" },
                    { label: "Email", value: memberForm.email },
                    { label: "Phone", value: memberForm.phone },
                    { label: "City", value: memberForm.city },
                    { label: "Why Glow Pass", value: memberForm.whyJoin || "Not provided" },
                    { label: "Referred By", value: memberForm.referredBy || "None" },
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between items-start py-2 border-b border-[var(--border)]">
                      <span className="text-[0.6rem] tracking-[0.15em] text-[var(--text-muted)] uppercase">{item.label}</span>
                      <span className="text-sm text-[var(--text-primary)] text-right max-w-[60%]">{item.value}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 glass-card p-4">
                  <p className="text-[var(--text-muted)] text-xs leading-relaxed">
                    By submitting, you agree to abide by The Code if accepted. Your application will be reviewed within 48 hours. Acceptance is not guaranteed.
                  </p>
                </div>
              </div>
            )}
          </>
        )}

        {/* ═══ VENUE FORM ═══ */}
        {role === "venue" && (
          <>
            {step === 1 && (
              <div className="space-y-5 animate-fade-in-up">
                <div>
                  <label className="label-text">Venue Name</label>
                  <input type="text" className="input-field" placeholder="e.g. Venue Name" value={venueForm.name} onChange={(e) => updateVenue("name", e.target.value)} />
                </div>
                <div>
                  <label className="label-text">Location / Area</label>
                  <input type="text" className="input-field" placeholder="e.g. Dubai Marina, Dubai" value={venueForm.location} onChange={(e) => updateVenue("location", e.target.value)} />
                </div>
                <div>
                  <label className="label-text">Venue Type</label>
                  <select className="select-field" value={venueForm.venueType} onChange={(e) => updateVenue("venueType", e.target.value)}>
                    <option value="">Select type</option>
                    <option value="nightclub">Nightclub</option>
                    <option value="lounge">Lounge / Bar</option>
                    <option value="rooftop">Rooftop</option>
                    <option value="beach_club">Beach Club</option>
                    <option value="restaurant">Restaurant & Bar</option>
                    <option value="hotel">Hotel Venue</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="label-text">Venue Capacity</label>
                  <input type="text" className="input-field" placeholder="e.g. 500" value={venueForm.capacity} onChange={(e) => updateVenue("capacity", e.target.value)} />
                </div>
                <div>
                  <label className="label-text">Instagram Handle</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-sm">@</span>
                    <input type="text" className="input-field pl-7" placeholder="venuename" value={venueForm.instagram} onChange={(e) => updateVenue("instagram", e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className="label-text">Contact Person Name</label>
                  <input type="text" className="input-field" placeholder="Manager or owner name" value={venueForm.contactName} onChange={(e) => updateVenue("contactName", e.target.value)} />
                </div>
                <div>
                  <label className="label-text">Contact Email</label>
                  <input type="email" className="input-field" placeholder="venue@email.com" value={venueForm.contactEmail} onChange={(e) => updateVenue("contactEmail", e.target.value)} />
                </div>
                <div>
                  <label className="label-text">Contact Phone</label>
                  <input type="tel" className="input-field" placeholder="+971 50 123 4567" value={venueForm.contactPhone} onChange={(e) => updateVenue("contactPhone", e.target.value)} />
                </div>
                <div>
                  <label className="label-text">Tell us about your venue</label>
                  <textarea className="textarea-field" placeholder="What makes your venue special? What nights are you looking to fill?" value={venueForm.description} onChange={(e) => updateVenue("description", e.target.value)} rows={3} />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="animate-fade-in-up">
                <div className="glass-card-gold p-6 space-y-4">
                  <p className="text-[0.6rem] tracking-[0.2em] text-[var(--text-muted)] uppercase mb-4">Review Your Registration</p>
                  {[
                    { label: "Venue Name", value: venueForm.name },
                    { label: "Location", value: venueForm.location },
                    { label: "Type", value: venueForm.venueType || "Not specified" },
                    { label: "Capacity", value: venueForm.capacity || "Not specified" },
                    { label: "Instagram", value: venueForm.instagram ? `@${venueForm.instagram.replace("@", "")}` : "—" },
                    { label: "Contact", value: venueForm.contactName },
                    { label: "Email", value: venueForm.contactEmail },
                    { label: "Phone", value: venueForm.contactPhone },
                    { label: "About", value: venueForm.description || "—" },
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between items-start py-2 border-b border-[var(--border)]">
                      <span className="text-[0.6rem] tracking-[0.15em] text-[var(--text-muted)] uppercase">{item.label}</span>
                      <span className="text-sm text-[var(--text-primary)] text-right max-w-[60%]">{item.value}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 glass-card p-4">
                  <p className="text-[var(--text-muted)] text-xs leading-relaxed">
                    By registering, you express interest in partnering with Glow Pass. Our team will review your venue and reach out to discuss terms. No commitment required at this stage.
                  </p>
                </div>
              </div>
            )}
          </>
        )}

        {/* Error */}
        {error && (
          <div className="mt-4 p-3 border border-[var(--danger)] bg-[rgba(248,113,113,0.05)] animate-fade-in">
            <p className="text-[var(--danger)] text-xs">{error}</p>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          {step > 1 ? (
            <button className="btn-outline btn-sm" onClick={() => setStep(step - 1)}>Back</button>
          ) : (
            <div />
          )}

          {step < totalSteps ? (
            <button className="btn-gold" onClick={nextStep}>Continue</button>
          ) : (
            <button
              className="btn-gold"
              onClick={role === "member" ? handleSubmitMember : handleSubmitVenue}
              disabled={submitting}
            >
              {submitting ? "Submitting..." : role === "member" ? "Submit Application" : "Register Venue"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ApplyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen hero-bg flex items-center justify-center">
        <div className="w-8 h-8 border border-[var(--border-gold)] flex items-center justify-center animate-pulse-glow">
          <div className="w-3 h-3 gold-gradient rotate-45" />
        </div>
      </div>
    }>
      <ApplyContent />
    </Suspense>
  );
}

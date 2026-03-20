import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Application, Member, Event, Venue, RSVP, EventTemplate, ContentProof } from '@/types';

let _supabase: SupabaseClient | null = null;
function getSupabase(): SupabaseClient {
  if (!_supabase) {
    _supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return _supabase;
}

// Use this everywhere instead of direct `supabase`
const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    return (getSupabase() as any)[prop];
  }
});

function generateAccessCode(prefix: string = 'CRC'): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = `${prefix}-`;
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function generateToken(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  let token = '';
  for (let i = 0; i < 16; i++) {
    token += chars[Math.floor(Math.random() * chars.length)];
  }
  return token;
}

// ── Helper: convert DB row (snake_case) to app object (camelCase) ──
function toApplication(row: Record<string, unknown>): Application {
  return {
    id: row.id as string,
    fullName: row.full_name as string,
    instagram: row.instagram as string,
    followerCount: row.follower_count as number,
    email: row.email as string,
    phone: row.phone as string,
    city: row.city as string,
    photos: (row.photos as string[]) || [],
    whyJoin: row.why_join as string,
    referredBy: row.referred_by as string,
    heardFrom: row.heard_from as string,
    status: row.status as Application['status'],
    appliedAt: row.applied_at as string,
    reviewedAt: row.reviewed_at as string,
    reviewNote: row.review_note as string,
  };
}

function toMember(row: Record<string, unknown>): Member {
  return {
    id: row.id as string,
    fullName: row.full_name as string,
    instagram: row.instagram as string,
    followerCount: row.follower_count as number,
    email: row.email as string,
    phone: row.phone as string,
    city: row.city as string,
    photos: (row.photos as string[]) || [],
    accessCode: row.access_code as string,
    tier: row.tier as Member['tier'],
    status: row.status as Member['status'],
    contentScore: row.content_score as number,
    eventsAttended: row.events_attended as number,
    joinedAt: row.joined_at as string,
    lastEventAt: row.last_event_at as string,
    strikes: row.strikes as number,
    noShows: row.no_shows as number,
    reliabilityScore: row.reliability_score as number,
    totalEventsApplied: row.total_events_applied as number,
    totalContentSubmitted: row.total_content_submitted as number,
    totalContentVerified: row.total_content_verified as number,
    blacklisted: row.blacklisted as boolean,
    blacklistedAt: row.blacklisted_at as string,
    blacklistReason: row.blacklist_reason as string,
    blockedByVenues: (row.blocked_by_venues as string[]) || [],
  };
}

function toVenue(row: Record<string, unknown>): Venue {
  return {
    id: row.id as string,
    name: row.name as string,
    location: row.location as string,
    contactName: row.contact_name as string,
    contactEmail: row.contact_email as string,
    contactPhone: row.contact_phone as string,
    instagram: row.instagram as string,
    description: row.description as string,
    venueType: row.venue_type as string,
    capacity: row.capacity as number,
    dealType: row.deal_type as string,
    rate: row.rate as string,
    notes: row.notes as string,
    status: row.status as Venue['status'],
    accessCode: row.access_code as string,
    totalEvents: row.total_events as number,
    totalMembersSent: row.total_members_sent as number,
    createdAt: row.created_at as string,
    approvedAt: row.approved_at as string,
    blockedCreators: (row.blocked_creators as string[]) || [],
  };
}

function toRsvp(row: Record<string, unknown>, contentProofs?: ContentProof[]): RSVP {
  return {
    memberId: row.member_id as string,
    memberName: row.member_name as string,
    instagram: row.instagram as string,
    followerCount: row.follower_count as number,
    status: row.status as RSVP['status'],
    rsvpAt: row.rsvp_at as string,
    checkInToken: row.check_in_token as string,
    checkedInAt: row.checked_in_at as string,
    checkedInBy: row.checked_in_by as string,
    contentStatus: row.content_status as RSVP['contentStatus'],
    contentPosted: row.content_posted as boolean,
    contentProofs: contentProofs || [],
  };
}

function toEvent(row: Record<string, unknown>, rsvps: RSVP[] = []): Event {
  return {
    id: row.id as string,
    title: row.title as string,
    venueName: row.venue_name as string,
    venueId: row.venue_id as string,
    date: row.date as string,
    time: row.time as string,
    arrivalDeadline: row.arrival_deadline as string,
    dressCode: row.dress_code as string,
    description: row.description as string,
    capacity: row.capacity as number,
    perks: (row.perks as string[]) || [],
    status: row.status as Event['status'],
    createdAt: row.created_at as string,
    completedAt: row.completed_at as string,
    templateId: row.template_id as string,
    rsvps,
  };
}

function toTemplate(row: Record<string, unknown>): EventTemplate {
  return {
    id: row.id as string,
    venueId: row.venue_id as string,
    venueName: row.venue_name as string,
    title: row.title as string,
    time: row.time as string,
    arrivalDeadline: row.arrival_deadline as string,
    dressCode: row.dress_code as string,
    description: row.description as string,
    capacity: row.capacity as number,
    perks: (row.perks as string[]) || [],
    createdAt: row.created_at as string,
  };
}

// Load RSVPs with content proofs for an event
async function loadRsvpsForEvent(eventId: string): Promise<RSVP[]> {
  const { data: rsvpRows } = await supabase
    .from('rsvps')
    .select('*')
    .eq('event_id', eventId);

  if (!rsvpRows || rsvpRows.length === 0) return [];

  const rsvpIds = rsvpRows.map(r => r.id);
  const { data: proofRows } = await supabase
    .from('content_proofs')
    .select('*')
    .in('rsvp_id', rsvpIds);

  return rsvpRows.map(r => {
    const proofs: ContentProof[] = (proofRows || [])
      .filter(p => p.rsvp_id === r.id)
      .map(p => ({
        link: p.link,
        type: p.type,
        submittedAt: p.submitted_at,
        verified: p.verified,
        verifiedAt: p.verified_at,
        verifiedBy: p.verified_by,
      }));
    return toRsvp(r, proofs);
  });
}

// ═══════════════════════════════════════════
// APPLICATIONS
// ═══════════════════════════════════════════

export async function getApplications(): Promise<Application[]> {
  const { data } = await supabase.from('applications').select('*').order('applied_at', { ascending: false });
  return (data || []).map(toApplication);
}

export async function getApplicationById(id: string): Promise<Application | undefined> {
  const { data } = await supabase.from('applications').select('*').eq('id', id).single();
  return data ? toApplication(data) : undefined;
}

export async function createApplication(appData: Omit<Application, 'id' | 'status' | 'appliedAt'>): Promise<Application> {
  const { data, error } = await supabase.from('applications').insert({
    full_name: appData.fullName,
    instagram: appData.instagram,
    follower_count: appData.followerCount || 0,
    email: appData.email,
    phone: appData.phone || '',
    city: appData.city || '',
    photos: appData.photos || [],
    why_join: appData.whyJoin || '',
    referred_by: appData.referredBy || '',
    heard_from: appData.heardFrom || '',
    status: 'pending',
  }).select().single();

  if (error) throw error;
  return toApplication(data);
}

export async function updateApplication(id: string, updates: Partial<Application>): Promise<Application | null> {
  const dbUpdates: Record<string, unknown> = {};
  if (updates.status !== undefined) dbUpdates.status = updates.status;
  if (updates.reviewNote !== undefined) dbUpdates.review_note = updates.reviewNote;
  if (updates.reviewedAt !== undefined) dbUpdates.reviewed_at = updates.reviewedAt;

  const { data, error } = await supabase.from('applications').update(dbUpdates).eq('id', id).select().single();
  if (error || !data) return null;
  return toApplication(data);
}

export async function checkDuplicateApplication(instagram: string, email: string): Promise<{ isDuplicate: boolean; reason?: string }> {
  const { data: apps } = await supabase.from('applications').select('id').or(`instagram.ilike.${instagram},email.ilike.${email}`);
  if (apps && apps.length > 0) {
    return { isDuplicate: true, reason: 'An application with this Instagram or email already exists.' };
  }
  const { data: members } = await supabase.from('members').select('id').or(`instagram.ilike.${instagram},email.ilike.${email}`);
  if (members && members.length > 0) {
    return { isDuplicate: true, reason: 'A member with this Instagram or email already exists.' };
  }
  return { isDuplicate: false };
}

// ═══════════════════════════════════════════
// MEMBERS
// ═══════════════════════════════════════════

export async function getMembers(): Promise<Member[]> {
  const { data } = await supabase.from('members').select('*').order('joined_at', { ascending: false });
  return (data || []).map(toMember);
}

export async function getMemberByCode(code: string): Promise<Member | undefined> {
  const { data } = await supabase.from('members').select('*').eq('access_code', code).single();
  return data ? toMember(data) : undefined;
}

export async function getMemberById(id: string): Promise<Member | undefined> {
  const { data } = await supabase.from('members').select('*').eq('id', id).single();
  return data ? toMember(data) : undefined;
}

export async function createMember(application: Application): Promise<Member> {
  const { data, error } = await supabase.from('members').insert({
    full_name: application.fullName,
    instagram: application.instagram,
    follower_count: application.followerCount,
    email: application.email,
    phone: application.phone,
    city: application.city,
    photos: application.photos || [],
    access_code: generateAccessCode(),
    tier: 'New',
    status: 'active',
    content_score: 0,
    events_attended: 0,
    strikes: 0,
    no_shows: 0,
    reliability_score: 100,
    total_events_applied: 0,
    total_content_submitted: 0,
    total_content_verified: 0,
    blocked_by_venues: [],
  }).select().single();

  if (error) throw error;
  return toMember(data);
}

export async function updateMember(id: string, updates: Partial<Member>): Promise<Member | null> {
  const dbUpdates: Record<string, unknown> = {};
  if (updates.fullName !== undefined) dbUpdates.full_name = updates.fullName;
  if (updates.status !== undefined) dbUpdates.status = updates.status;
  if (updates.tier !== undefined) dbUpdates.tier = updates.tier;
  if (updates.contentScore !== undefined) dbUpdates.content_score = updates.contentScore;
  if (updates.eventsAttended !== undefined) dbUpdates.events_attended = updates.eventsAttended;
  if (updates.lastEventAt !== undefined) dbUpdates.last_event_at = updates.lastEventAt;
  if (updates.strikes !== undefined) dbUpdates.strikes = updates.strikes;
  if (updates.noShows !== undefined) dbUpdates.no_shows = updates.noShows;
  if (updates.reliabilityScore !== undefined) dbUpdates.reliability_score = updates.reliabilityScore;
  if (updates.totalEventsApplied !== undefined) dbUpdates.total_events_applied = updates.totalEventsApplied;
  if (updates.totalContentSubmitted !== undefined) dbUpdates.total_content_submitted = updates.totalContentSubmitted;
  if (updates.totalContentVerified !== undefined) dbUpdates.total_content_verified = updates.totalContentVerified;
  if (updates.blacklisted !== undefined) dbUpdates.blacklisted = updates.blacklisted;
  if (updates.blacklistedAt !== undefined) dbUpdates.blacklisted_at = updates.blacklistedAt;
  if (updates.blacklistReason !== undefined) dbUpdates.blacklist_reason = updates.blacklistReason;
  if (updates.blockedByVenues !== undefined) dbUpdates.blocked_by_venues = updates.blockedByVenues;

  if (Object.keys(dbUpdates).length === 0) return (await getMemberById(id)) as Member | null;

  const { data, error } = await supabase.from('members').update(dbUpdates).eq('id', id).select().single();
  if (error || !data) return null;
  return toMember(data);
}

export async function addStrike(memberId: string, reason: string = 'no_show'): Promise<Member | null> {
  const member = await getMemberById(memberId);
  if (!member) return null;

  const newStrikes = (member.strikes || 0) + 1;
  const newNoShows = reason === 'no_show' ? (member.noShows || 0) + 1 : (member.noShows || 0);
  const newStatus = newStrikes >= 3 ? 'suspended' : member.status;
  const newReliability = calculateReliability(member.eventsAttended, newNoShows, member.totalContentVerified || 0, member.totalEventsApplied || 0);

  return updateMember(memberId, {
    strikes: newStrikes,
    noShows: newNoShows,
    status: newStatus as Member['status'],
    reliabilityScore: newReliability,
  });
}

export async function blacklistMember(memberId: string, reason: string): Promise<Member | null> {
  return updateMember(memberId, {
    status: 'blacklisted',
    blacklisted: true,
    blacklistedAt: new Date().toISOString(),
    blacklistReason: reason,
  });
}

function calculateReliability(attended: number, noShows: number, contentVerified: number, totalApplied: number): number {
  if (totalApplied === 0) return 100;
  const attendanceRate = totalApplied > 0 ? (attended / Math.max(totalApplied, 1)) * 50 : 50;
  const noShowPenalty = noShows * 10;
  const contentBonus = Math.min(contentVerified * 2, 20);
  return Math.max(0, Math.min(100, Math.round(attendanceRate + 50 - noShowPenalty + contentBonus)));
}

export async function recalculateTier(memberId: string): Promise<Member | null> {
  const member = await getMemberById(memberId);
  if (!member) return null;

  let newTier: Member['tier'] = 'New';
  if (member.eventsAttended >= 15 && member.contentScore >= 80 && member.reliabilityScore >= 90) {
    newTier = 'Muse';
  } else if (member.eventsAttended >= 5 && member.contentScore >= 30 && member.reliabilityScore >= 70) {
    newTier = 'Inner Circle';
  }

  if (newTier !== member.tier) {
    return updateMember(memberId, { tier: newTier });
  }
  return member;
}

export async function recalculateContentScore(memberId: string): Promise<Member | null> {
  const { data: proofs } = await supabase
    .from('content_proofs')
    .select('*')
    .eq('member_id', memberId);

  let totalScore = 0;
  let totalSubmitted = 0;
  let totalVerified = 0;

  for (const proof of (proofs || [])) {
    totalSubmitted++;
    if (proof.verified) {
      totalVerified++;
      if (proof.type === 'story') totalScore += 1;
      else if (proof.type === 'post') totalScore += 3;
      else if (proof.type === 'reel') totalScore += 5;
    }
  }

  return updateMember(memberId, {
    contentScore: totalScore,
    totalContentSubmitted: totalSubmitted,
    totalContentVerified: totalVerified,
  });
}

export async function getCreatorProfile(memberId: string) {
  const member = await getMemberById(memberId);
  if (!member) return null;

  const { data: rsvpRows } = await supabase
    .from('rsvps')
    .select('*, events(id, title, venue_name, date)')
    .eq('member_id', memberId);

  const { data: proofRows } = await supabase
    .from('content_proofs')
    .select('*')
    .eq('member_id', memberId);

  const eventHistory = (rsvpRows || []).map(r => {
    const evt = r.events as Record<string, unknown> | null;
    const proofs = (proofRows || []).filter(p => p.rsvp_id === r.id);
    return {
      eventId: evt?.id || r.event_id,
      title: evt?.title || '',
      venueName: evt?.venue_name || '',
      date: evt?.date || '',
      status: r.status,
      contentStatus: r.content_status || 'not_submitted',
      contentProofs: proofs.map((p: Record<string, unknown>) => ({
        link: p.link,
        type: p.type,
        submittedAt: p.submitted_at,
        verified: p.verified,
        verifiedAt: p.verified_at,
        verifiedBy: p.verified_by,
      })),
    };
  });

  return {
    ...member,
    eventHistory,
    attendanceRate: member.totalEventsApplied > 0
      ? Math.round((member.eventsAttended / member.totalEventsApplied) * 100)
      : 100,
  };
}

// ═══════════════════════════════════════════
// EVENTS
// ═══════════════════════════════════════════

export async function getEvents(): Promise<Event[]> {
  const { data: eventRows } = await supabase.from('events').select('*').order('created_at', { ascending: false });
  if (!eventRows) return [];

  const eventIds = eventRows.map(e => e.id);
  const { data: rsvpRows } = await supabase.from('rsvps').select('*').in('event_id', eventIds.length > 0 ? eventIds : ['__none__']);
  const rsvpIds = (rsvpRows || []).map(r => r.id);
  const { data: proofRows } = await supabase.from('content_proofs').select('*').in('rsvp_id', rsvpIds.length > 0 ? rsvpIds : ['__none__']);

  return eventRows.map(e => {
    const eRsvps = (rsvpRows || []).filter(r => r.event_id === e.id).map(r => {
      const proofs: ContentProof[] = (proofRows || [])
        .filter(p => p.rsvp_id === r.id)
        .map(p => ({ link: p.link, type: p.type, submittedAt: p.submitted_at, verified: p.verified, verifiedAt: p.verified_at, verifiedBy: p.verified_by }));
      return toRsvp(r, proofs);
    });
    return toEvent(e, eRsvps);
  });
}

export async function getEventById(id: string): Promise<Event | undefined> {
  const { data } = await supabase.from('events').select('*').eq('id', id).single();
  if (!data) return undefined;
  const rsvps = await loadRsvpsForEvent(id);
  return toEvent(data, rsvps);
}

export async function createEvent(eventData: Omit<Event, 'id' | 'rsvps' | 'createdAt'>): Promise<Event> {
  const { data, error } = await supabase.from('events').insert({
    title: eventData.title,
    venue_name: eventData.venueName,
    venue_id: eventData.venueId || null,
    date: eventData.date || '',
    time: eventData.time || '',
    arrival_deadline: eventData.arrivalDeadline || '',
    dress_code: eventData.dressCode || '',
    description: eventData.description || '',
    capacity: eventData.capacity || 10,
    perks: eventData.perks || [],
    status: eventData.status || 'upcoming',
    template_id: eventData.templateId || null,
  }).select().single();

  if (error) throw error;
  return toEvent(data, []);
}

export async function updateEvent(id: string, updates: Partial<Event>): Promise<Event | null> {
  const dbUpdates: Record<string, unknown> = {};
  if (updates.title !== undefined) dbUpdates.title = updates.title;
  if (updates.status !== undefined) dbUpdates.status = updates.status;
  if (updates.completedAt !== undefined) dbUpdates.completed_at = updates.completedAt;
  if (updates.date !== undefined) dbUpdates.date = updates.date;
  if (updates.time !== undefined) dbUpdates.time = updates.time;
  if (updates.description !== undefined) dbUpdates.description = updates.description;
  if (updates.capacity !== undefined) dbUpdates.capacity = updates.capacity;

  if (Object.keys(dbUpdates).length === 0) return (await getEventById(id)) as Event | null;

  const { data, error } = await supabase.from('events').update(dbUpdates).eq('id', id).select().single();
  if (error || !data) return null;
  const rsvps = await loadRsvpsForEvent(id);
  return toEvent(data, rsvps);
}

export async function addRSVP(eventId: string, rsvp: RSVP): Promise<Event | null> {
  // Check if RSVP exists
  const { data: existing } = await supabase
    .from('rsvps')
    .select('id')
    .eq('event_id', eventId)
    .eq('member_id', rsvp.memberId)
    .single();

  if (existing) {
    // Update existing RSVP
    const rsvpUpdates: Record<string, unknown> = {
      status: rsvp.status,
      member_name: rsvp.memberName,
      instagram: rsvp.instagram,
      follower_count: rsvp.followerCount,
    };
    if (rsvp.checkInToken) rsvpUpdates.check_in_token = rsvp.checkInToken;
    if (rsvp.checkedInAt) rsvpUpdates.checked_in_at = rsvp.checkedInAt;
    if (rsvp.checkedInBy) rsvpUpdates.checked_in_by = rsvp.checkedInBy;
    if (rsvp.contentStatus) rsvpUpdates.content_status = rsvp.contentStatus;
    if (rsvp.contentPosted !== undefined) rsvpUpdates.content_posted = rsvp.contentPosted;

    await supabase.from('rsvps').update(rsvpUpdates).eq('id', existing.id);

    // Handle content proofs if present
    if (rsvp.contentProofs && rsvp.contentProofs.length > 0) {
      // Delete old proofs and insert new ones
      await supabase.from('content_proofs').delete().eq('rsvp_id', existing.id);
      const proofInserts = rsvp.contentProofs.map(p => ({
        rsvp_id: existing.id,
        event_id: eventId,
        member_id: rsvp.memberId,
        link: p.link,
        type: p.type,
        submitted_at: p.submittedAt || new Date().toISOString(),
        verified: p.verified || false,
        verified_at: p.verifiedAt || null,
        verified_by: p.verifiedBy || null,
      }));
      await supabase.from('content_proofs').insert(proofInserts);
    }
  } else {
    // Insert new RSVP
    const { data: newRsvp } = await supabase.from('rsvps').insert({
      event_id: eventId,
      member_id: rsvp.memberId,
      member_name: rsvp.memberName || '',
      instagram: rsvp.instagram || '',
      follower_count: rsvp.followerCount || 0,
      status: rsvp.status,
      rsvp_at: rsvp.rsvpAt || new Date().toISOString(),
      check_in_token: rsvp.checkInToken || null,
    }).select().single();

    // Insert content proofs if present
    if (newRsvp && rsvp.contentProofs && rsvp.contentProofs.length > 0) {
      const proofInserts = rsvp.contentProofs.map(p => ({
        rsvp_id: newRsvp.id,
        event_id: eventId,
        member_id: rsvp.memberId,
        link: p.link,
        type: p.type,
        submitted_at: p.submittedAt || new Date().toISOString(),
        verified: p.verified || false,
        verified_at: p.verifiedAt || null,
        verified_by: p.verifiedBy || null,
      }));
      await supabase.from('content_proofs').insert(proofInserts);
    }
  }

  return (await getEventById(eventId)) as Event | null;
}

export async function completeEvent(eventId: string): Promise<Event | null> {
  const event = await getEventById(eventId);
  if (!event) return null;

  for (const rsvp of event.rsvps) {
    if (rsvp.status === 'confirmed') {
      // Mark as no_show
      await supabase.from('rsvps')
        .update({ status: 'no_show' })
        .eq('event_id', eventId)
        .eq('member_id', rsvp.memberId);
      await addStrike(rsvp.memberId, 'no_show');
    }
    if (rsvp.status === 'attended') {
      const member = await getMemberById(rsvp.memberId);
      if (member) {
        await updateMember(member.id, {
          eventsAttended: (member.eventsAttended || 0) + 1,
          lastEventAt: new Date().toISOString(),
        });
        await recalculateContentScore(member.id);
        await recalculateTier(member.id);
      }
    }
  }

  return updateEvent(eventId, {
    status: 'completed',
    completedAt: new Date().toISOString(),
  });
}

export async function generateCheckInToken(eventId: string, memberId: string): Promise<string | null> {
  const token = generateToken();
  const { error } = await supabase
    .from('rsvps')
    .update({ check_in_token: token })
    .eq('event_id', eventId)
    .eq('member_id', memberId)
    .eq('status', 'confirmed');

  return error ? null : token;
}

export async function checkInByToken(token: string): Promise<{ event: Event; memberName: string } | null> {
  const { data: rsvp } = await supabase
    .from('rsvps')
    .select('*, events(*)')
    .eq('check_in_token', token)
    .eq('status', 'confirmed')
    .single();

  if (!rsvp) return null;

  await supabase.from('rsvps').update({
    status: 'attended',
    checked_in_at: new Date().toISOString(),
    checked_in_by: 'qr',
  }).eq('id', rsvp.id);

  const event = await getEventById(rsvp.event_id);
  if (!event) return null;

  return { event, memberName: rsvp.member_name };
}

// ═══════════════════════════════════════════
// EVENT TEMPLATES
// ═══════════════════════════════════════════

export async function getTemplates(): Promise<EventTemplate[]> {
  const { data } = await supabase.from('event_templates').select('*').order('created_at', { ascending: false });
  return (data || []).map(toTemplate);
}

export async function getTemplatesByVenue(venueId: string): Promise<EventTemplate[]> {
  const { data } = await supabase.from('event_templates').select('*').eq('venue_id', venueId);
  return (data || []).map(toTemplate);
}

export async function createTemplate(templateData: Omit<EventTemplate, 'id' | 'createdAt'>): Promise<EventTemplate> {
  const { data, error } = await supabase.from('event_templates').insert({
    venue_id: templateData.venueId,
    venue_name: templateData.venueName,
    title: templateData.title,
    time: templateData.time || '',
    arrival_deadline: templateData.arrivalDeadline || '',
    dress_code: templateData.dressCode || '',
    description: templateData.description || '',
    capacity: templateData.capacity || 10,
    perks: templateData.perks || [],
  }).select().single();

  if (error) throw error;
  return toTemplate(data);
}

export async function deleteTemplate(id: string): Promise<boolean> {
  const { error } = await supabase.from('event_templates').delete().eq('id', id);
  return !error;
}

export async function createEventFromTemplate(templateId: string, date: string): Promise<Event | null> {
  const { data: tmpl } = await supabase.from('event_templates').select('*').eq('id', templateId).single();
  if (!tmpl) return null;

  return createEvent({
    venueId: tmpl.venue_id,
    venueName: tmpl.venue_name,
    title: tmpl.title,
    date,
    time: tmpl.time,
    arrivalDeadline: tmpl.arrival_deadline,
    dressCode: tmpl.dress_code,
    description: tmpl.description,
    capacity: tmpl.capacity,
    perks: tmpl.perks || [],
    status: 'upcoming',
    templateId,
  });
}

// ═══════════════════════════════════════════
// VENUES
// ═══════════════════════════════════════════

export async function getVenues(): Promise<Venue[]> {
  const { data } = await supabase.from('venues').select('*').order('created_at', { ascending: false });
  return (data || []).map(toVenue);
}

export async function getVenueByCode(code: string): Promise<Venue | undefined> {
  const { data } = await supabase.from('venues').select('*').eq('access_code', code).single();
  return data ? toVenue(data) : undefined;
}

export async function getVenueById(id: string): Promise<Venue | undefined> {
  const { data } = await supabase.from('venues').select('*').eq('id', id).single();
  return data ? toVenue(data) : undefined;
}

export async function createVenue(venueData: Omit<Venue, 'id' | 'totalEvents' | 'totalMembersSent' | 'createdAt' | 'accessCode'>): Promise<Venue> {
  const { data, error } = await supabase.from('venues').insert({
    name: venueData.name,
    location: venueData.location || '',
    contact_name: venueData.contactName || '',
    contact_email: venueData.contactEmail || '',
    contact_phone: venueData.contactPhone || '',
    instagram: venueData.instagram || '',
    description: venueData.description || '',
    venue_type: venueData.venueType || '',
    capacity: venueData.capacity || 0,
    deal_type: venueData.dealType || '',
    rate: venueData.rate || '',
    notes: venueData.notes || '',
    status: venueData.status || 'pending',
    access_code: generateAccessCode('VNU'),
    total_events: 0,
    total_members_sent: 0,
    blocked_creators: [],
  }).select().single();

  if (error) throw error;
  return toVenue(data);
}

export async function updateVenue(id: string, updates: Partial<Venue>): Promise<Venue | null> {
  const dbUpdates: Record<string, unknown> = {};
  if (updates.name !== undefined) dbUpdates.name = updates.name;
  if (updates.status !== undefined) dbUpdates.status = updates.status;
  if (updates.approvedAt !== undefined) dbUpdates.approved_at = updates.approvedAt;
  if (updates.blockedCreators !== undefined) dbUpdates.blocked_creators = updates.blockedCreators;
  if (updates.totalEvents !== undefined) dbUpdates.total_events = updates.totalEvents;
  if (updates.totalMembersSent !== undefined) dbUpdates.total_members_sent = updates.totalMembersSent;

  if (Object.keys(dbUpdates).length === 0) return (await getVenueById(id)) as Venue | null;

  const { data, error } = await supabase.from('venues').update(dbUpdates).eq('id', id).select().single();
  if (error || !data) return null;
  return toVenue(data);
}

export async function blockCreator(venueId: string, memberId: string): Promise<void> {
  const venue = await getVenueById(venueId);
  if (!venue) return;
  const blocked = venue.blockedCreators || [];
  if (!blocked.includes(memberId)) {
    blocked.push(memberId);
    await updateVenue(venueId, { blockedCreators: blocked });
  }
  const member = await getMemberById(memberId);
  if (member) {
    const blockedBy = member.blockedByVenues || [];
    if (!blockedBy.includes(venueId)) {
      blockedBy.push(venueId);
      await updateMember(memberId, { blockedByVenues: blockedBy });
    }
  }
}

// ═══════════════════════════════════════════
// ANALYTICS
// ═══════════════════════════════════════════

export async function getAnalytics() {
  const events = await getEvents();
  const members = await getMembers();
  const venues = await getVenues();

  const completedEvents = events.filter(e => e.status === 'completed');
  const allRsvps = events.flatMap(e => e.rsvps);

  const totalAttended = allRsvps.filter(r => r.status === 'attended').length;
  const totalNoShows = allRsvps.filter(r => r.status === 'no_show').length;
  const totalConfirmed = allRsvps.filter(r => ['confirmed', 'attended', 'no_show'].includes(r.status)).length;
  const totalContentSubmitted = allRsvps.filter(r => r.contentStatus === 'submitted' || r.contentStatus === 'verified').length;
  const totalContentVerified = allRsvps.filter(r => r.contentStatus === 'verified').length;

  const venueStats = venues.filter(v => v.status === 'active').map(v => {
    const venueEvents = events.filter(e => e.venueId === v.id || e.venueName.toLowerCase() === v.name.toLowerCase());
    const venueRsvps = venueEvents.flatMap(e => e.rsvps);
    const vAttended = venueRsvps.filter(r => r.status === 'attended').length;
    const vNoShows = venueRsvps.filter(r => r.status === 'no_show').length;
    const vContent = venueRsvps.filter(r => r.contentStatus === 'verified').length;
    return {
      venueId: v.id,
      venueName: v.name,
      totalEvents: venueEvents.length,
      totalCreators: vAttended,
      noShows: vNoShows,
      contentVerified: vContent,
      attendanceRate: (vAttended + vNoShows) > 0 ? Math.round((vAttended / (vAttended + vNoShows)) * 100) : 0,
    };
  });

  const leaderboard = [...members]
    .filter(m => m.status === 'active')
    .sort((a, b) => (b.contentScore || 0) - (a.contentScore || 0))
    .slice(0, 10)
    .map(m => ({
      id: m.id,
      name: m.fullName,
      instagram: m.instagram,
      contentScore: m.contentScore || 0,
      eventsAttended: m.eventsAttended || 0,
      reliabilityScore: m.reliabilityScore ?? 100,
      tier: m.tier,
    }));

  const now = new Date();
  const monthlyData = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const monthEvents = events.filter(e => (e.date || '').startsWith(monthKey));
    const monthRsvps = monthEvents.flatMap(e => e.rsvps);
    monthlyData.push({
      month: d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      events: monthEvents.length,
      attended: monthRsvps.filter(r => r.status === 'attended').length,
      content: monthRsvps.filter(r => r.contentStatus === 'verified').length,
    });
  }

  return {
    overview: {
      totalEvents: events.length,
      completedEvents: completedEvents.length,
      totalMembers: members.length,
      activeMembers: members.filter(m => m.status === 'active').length,
      suspendedMembers: members.filter(m => m.status === 'suspended').length,
      blacklistedMembers: members.filter(m => m.status === 'blacklisted').length,
      totalVenues: venues.filter(v => v.status === 'active').length,
      attendanceRate: totalConfirmed > 0 ? Math.round((totalAttended / totalConfirmed) * 100) : 0,
      noShowRate: totalConfirmed > 0 ? Math.round((totalNoShows / totalConfirmed) * 100) : 0,
      contentRate: totalAttended > 0 ? Math.round((totalContentVerified / totalAttended) * 100) : 0,
      totalAttended,
      totalNoShows,
      totalContentSubmitted,
      totalContentVerified,
      avgReliabilityScore: members.length > 0 ? Math.round(members.reduce((s, m) => s + (m.reliabilityScore ?? 100), 0) / members.length) : 100,
    },
    venueStats,
    leaderboard,
    monthlyData,
  };
}

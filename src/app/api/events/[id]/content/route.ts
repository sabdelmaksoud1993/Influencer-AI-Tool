import { NextRequest, NextResponse } from 'next/server';
import { getEventById, addRSVP, getMemberByCode, getVenueByCode, recalculateContentScore, recalculateTier, getMemberById } from '@/lib/db';
import { notifyAdminContentSubmitted, sendContentVerified } from '@/lib/email';

// Creator submits content proof OR venue/admin verifies it
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const event = await getEventById(id);
  if (!event) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 });
  }

  // ── Creator submitting content proof ──
  if (body.accessCode && body.links) {
    const member = await getMemberByCode(body.accessCode);
    if (!member) {
      return NextResponse.json({ error: 'Invalid access code' }, { status: 401 });
    }

    const existingRsvp = event.rsvps.find(r => r.memberId === member.id);
    if (!existingRsvp) {
      return NextResponse.json({ error: 'RSVP not found' }, { status: 404 });
    }

    if (existingRsvp.status !== 'attended') {
      return NextResponse.json({ error: 'You must be checked in first' }, { status: 400 });
    }

    const contentProofs = (body.links as { link: string; type: string }[]).map(l => ({
      link: l.link,
      type: l.type as 'story' | 'post' | 'reel',
      submittedAt: new Date().toISOString(),
    }));

    const updatedRsvp = {
      ...existingRsvp,
      contentProofs: [...(existingRsvp.contentProofs || []), ...contentProofs],
      contentStatus: 'submitted' as const,
      contentPosted: true,
    };

    const updated = await addRSVP(id, updatedRsvp);

    // Notify admin of content submission
    notifyAdminContentSubmitted(member.fullName, member.instagram, event.title, contentProofs.length).catch(console.error);

    return NextResponse.json(updated);
  }

  // ── Venue or Admin verifying content ──
  const venueCode = request.headers.get('x-venue-code');
  const adminKey = request.headers.get('x-admin-key');

  if (!venueCode && adminKey !== 'cercle2024') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Verify venue owns this event
  if (venueCode) {
    const venue = await getVenueByCode(venueCode);
    if (!venue || venue.status !== 'active') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (event.venueId !== venue.id && event.venueName.toLowerCase() !== venue.name.toLowerCase()) {
      return NextResponse.json({ error: 'Not your event' }, { status: 403 });
    }
  }

  const { memberId, verified } = body;
  if (!memberId) {
    return NextResponse.json({ error: 'Missing memberId' }, { status: 400 });
  }

  const existingRsvp = event.rsvps.find(r => r.memberId === memberId);
  if (!existingRsvp) {
    return NextResponse.json({ error: 'RSVP not found' }, { status: 404 });
  }

  const verifiedBy = venueCode ? 'venue' : 'admin';
  const now = new Date().toISOString();

  const updatedProofs = (existingRsvp.contentProofs || []).map(p => ({
    ...p,
    verified: verified !== false,
    verifiedAt: now,
    verifiedBy: verifiedBy as 'venue' | 'admin',
  }));

  const updatedRsvp = {
    ...existingRsvp,
    contentProofs: updatedProofs,
    contentStatus: 'verified' as const,
    contentPosted: true,
  };

  const updated = await addRSVP(id, updatedRsvp);

  // Auto-recalculate content score and tier
  await recalculateContentScore(memberId);
  await recalculateTier(memberId);

  // Send verification email to creator
  const creatorMember = await getMemberById(memberId);
  if (creatorMember?.email) {
    const scoreMap: Record<string, number> = { story: 1, post: 3, reel: 5 };
    const totalScore = updatedProofs.reduce((sum, p) => sum + (scoreMap[p.type] || 1), 0);
    sendContentVerified(creatorMember.email, creatorMember.fullName, event.title, totalScore).catch(console.error);
  }

  return NextResponse.json(updated);
}

import { NextRequest, NextResponse } from 'next/server';
import { getEventById, addRSVP, getMemberByCode, getVenueByCode, getVenueById, generateCheckInToken, updateMember, getMemberById } from '@/lib/db';
import { sendEventAccepted, sendEventRejected } from '@/lib/email';
import { notifyRSVPConfirmed } from '@/lib/push';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { accessCode, status } = body;

  if (!accessCode) {
    return NextResponse.json({ error: 'Missing access code' }, { status: 400 });
  }

  const event = await getEventById(id);
  if (!event) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 });
  }

  // ── Venue reviewing a creator application ──
  const venueCode = request.headers.get('x-venue-code');
  if (venueCode && body.memberId && (status === 'confirmed' || status === 'declined')) {
    const venue = await getVenueByCode(venueCode);
    if (!venue || venue.status !== 'active') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (event.venueId !== venue.id && event.venueName.toLowerCase() !== venue.name.toLowerCase()) {
      return NextResponse.json({ error: 'Not your event' }, { status: 403 });
    }

    if (status === 'confirmed') {
      const confirmedCount = event.rsvps.filter(r => r.status === 'confirmed' || r.status === 'attended').length;
      if (confirmedCount >= event.capacity) {
        return NextResponse.json({ error: 'Event is at capacity' }, { status: 400 });
      }
    }

    const existingRsvp = event.rsvps.find(r => r.memberId === body.memberId);
    if (!existingRsvp) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    const updatedRsvp = {
      ...existingRsvp,
      status: status as 'confirmed' | 'declined',
    };

    const updated = await addRSVP(id, updatedRsvp);

    // Generate QR check-in token when accepted + send email
    if (status === 'confirmed') {
      await generateCheckInToken(id, body.memberId);
      // Trigger: RSVP confirmed → notify creator
      notifyRSVPConfirmed(body.memberId, event.title, id).catch(() => {});
      const creatorMember = await getMemberById(body.memberId);
      if (creatorMember?.email) {
        const eventDate = event.date || 'TBD';
        sendEventAccepted(creatorMember.email, creatorMember.fullName, event.title, event.venueName, eventDate).catch(console.error);
      }
    }

    // Send rejection email
    if (status === 'declined') {
      const creatorMember = await getMemberById(body.memberId);
      if (creatorMember?.email) {
        sendEventRejected(creatorMember.email, creatorMember.fullName, event.title).catch(console.error);
      }
    }

    return NextResponse.json(updated);
  }

  // ── Creator applying to an event ──
  if (!status) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const member = await getMemberByCode(accessCode);
  if (!member) {
    return NextResponse.json({ error: 'Invalid access code' }, { status: 401 });
  }

  if (member.status !== 'active') {
    const msg = member.status === 'suspended'
      ? 'Your account is suspended due to too many no-shows.'
      : member.status === 'blacklisted'
      ? 'Your account has been blacklisted.'
      : 'Membership is not active';
    return NextResponse.json({ error: msg }, { status: 403 });
  }

  // Check if creator is blocked by this venue
  if (event.venueId) {
    const venue = await getVenueById(event.venueId);
    if (venue?.blockedCreators?.includes(member.id)) {
      return NextResponse.json({ error: 'You cannot apply to events at this venue.' }, { status: 403 });
    }
  }

  // Check if already applied
  if (status === 'pending') {
    const existing = event.rsvps.find(r => r.memberId === member.id);
    if (existing) {
      return NextResponse.json({ error: 'You have already applied to this event' }, { status: 400 });
    }
  }

  // If declining, allow it
  if (status === 'declined') {
    const rsvp = {
      memberId: member.id,
      memberName: member.fullName,
      instagram: member.instagram,
      followerCount: member.followerCount,
      status: 'declined' as const,
      rsvpAt: new Date().toISOString(),
    };
    const updated = await addRSVP(id, rsvp);
    return NextResponse.json(updated);
  }

  // Creator applies — status starts as 'pending'
  const rsvp = {
    memberId: member.id,
    memberName: member.fullName,
    instagram: member.instagram,
    followerCount: member.followerCount,
    status: 'pending' as const,
    rsvpAt: new Date().toISOString(),
  };

  const updated = await addRSVP(id, rsvp);

  // Track total applications
  await updateMember(member.id, {
    totalEventsApplied: (member.totalEventsApplied || 0) + 1,
  });

  return NextResponse.json(updated);
}

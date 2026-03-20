import { NextRequest, NextResponse } from 'next/server';
import { getEventById, addRSVP, getVenueByCode } from '@/lib/db';

// Venue checks in a creator (marks as attended or no_show)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const venueCode = request.headers.get('x-venue-code');
  const adminKey = request.headers.get('x-admin-key');

  if (!venueCode && adminKey !== 'cercle2024') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const event = await getEventById(id);
  if (!event) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 });
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

  const body = await request.json();
  const { memberId, action } = body; // action: 'checkin' | 'no_show'

  if (!memberId || !action) {
    return NextResponse.json({ error: 'Missing memberId or action' }, { status: 400 });
  }

  const existingRsvp = event.rsvps.find(r => r.memberId === memberId);
  if (!existingRsvp) {
    return NextResponse.json({ error: 'RSVP not found' }, { status: 404 });
  }

  if (existingRsvp.status !== 'confirmed' && existingRsvp.status !== 'attended') {
    return NextResponse.json({ error: 'Creator must be accepted first' }, { status: 400 });
  }

  const updatedRsvp = {
    ...existingRsvp,
    status: action === 'checkin' ? 'attended' as const : 'no_show' as const,
    checkedInAt: action === 'checkin' ? new Date().toISOString() : undefined,
    checkedInBy: venueCode ? 'venue' : 'admin',
    contentStatus: existingRsvp.contentStatus || 'not_submitted',
  };

  const updated = await addRSVP(id, updatedRsvp);
  return NextResponse.json(updated);
}

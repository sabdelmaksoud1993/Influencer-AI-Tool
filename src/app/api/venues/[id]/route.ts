import { NextRequest, NextResponse } from 'next/server';
import { getVenueByCode, getEvents } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Try to find by access code (venue login)
  const venue = await getVenueByCode(id);
  if (!venue) {
    return NextResponse.json({ error: 'Venue not found' }, { status: 404 });
  }

  if (venue.status === 'pending') {
    return NextResponse.json({
      venue: { ...venue, accessCode: undefined },
      pending: true,
      events: [],
      stats: { totalEvents: 0, totalConfirmed: 0, totalAttended: 0, totalContent: 0 },
    });
  }

  // Get events for this venue
  const allEvents = await getEvents();
  const venueEvents = allEvents
    .filter(e => e.venueName.toLowerCase() === venue.name.toLowerCase() || e.venueId === venue.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalConfirmed = venueEvents.reduce(
    (sum, e) => sum + e.rsvps.filter(r => r.status === 'confirmed' || r.status === 'attended').length, 0
  );
  const totalAttended = venueEvents.reduce(
    (sum, e) => sum + e.rsvps.filter(r => r.status === 'attended').length, 0
  );
  const totalContent = venueEvents.reduce(
    (sum, e) => sum + e.rsvps.filter(r => r.contentPosted).length, 0
  );

  return NextResponse.json({
    venue,
    pending: false,
    events: venueEvents.map(e => ({
      id: e.id,
      title: e.title,
      date: e.date,
      time: e.time,
      status: e.status,
      capacity: e.capacity,
      confirmed: e.rsvps.filter(r => r.status === 'confirmed' || r.status === 'attended').length,
      attended: e.rsvps.filter(r => r.status === 'attended').length,
      contentPosted: e.rsvps.filter(r => r.contentPosted).length,
      rsvps: e.rsvps,
    })),
    stats: {
      totalEvents: venueEvents.length,
      totalConfirmed,
      totalAttended,
      totalContent,
    },
  });
}

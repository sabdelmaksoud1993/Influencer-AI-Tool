import { NextRequest, NextResponse } from 'next/server';
import { getEvents, createEvent, getVenueByCode } from '@/lib/db';
import { notifyNewEvent } from '@/lib/push';

export async function GET(request: NextRequest) {
  const events = await getEvents();
  const isAdmin = request.headers.get('x-admin-key') === 'cercle2024';

  if (isAdmin) {
    return NextResponse.json(events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  }

  // Non-admin: only show upcoming events with limited info
  const upcoming = events
    .filter(e => e.status === 'upcoming' || e.status === 'active')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return NextResponse.json(upcoming);
}

export async function POST(request: NextRequest) {
  const adminKey = request.headers.get('x-admin-key');
  const venueCode = request.headers.get('x-venue-code');

  // Auth: either admin or authenticated venue
  let venueId = '';
  let venueName = '';

  if (adminKey === 'cercle2024') {
    // Admin can create events for any venue
  } else if (venueCode) {
    const venue = await getVenueByCode(venueCode);
    if (!venue || venue.status !== 'active') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    venueId = venue.id;
    venueName = venue.name;
  } else {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const event = await createEvent({
      venueId: venueId || body.venueId || '',
      venueName: venueName || body.venueName,
      title: body.title,
      date: body.date,
      time: body.time,
      arrivalDeadline: body.arrivalDeadline,
      dressCode: body.dressCode || '',
      description: body.description || '',
      capacity: parseInt(body.capacity) || 30,
      perks: body.perks || [],
      status: 'upcoming',
    });
    // Trigger: New event → notify all creators
    notifyNewEvent(event.title, event.venueName, event.id).catch(() => {});
    return NextResponse.json(event, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

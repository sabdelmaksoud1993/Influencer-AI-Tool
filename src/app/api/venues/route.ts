import { NextRequest, NextResponse } from 'next/server';
import { getVenues, createVenue } from '@/lib/db';
import { notifyAdminNewVenue } from '@/lib/email';
import { notifyVenuePending } from '@/lib/push';

export async function GET(request: NextRequest) {
  const password = request.headers.get('x-admin-key');
  if (password !== 'cercle2024') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const venues = await getVenues();
  return NextResponse.json(venues);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const isAdmin = request.headers.get('x-admin-key') === 'cercle2024';

    // Public venue registration (no admin key needed)
    if (!body.name || !body.location || !body.contactName || !body.contactEmail || !body.contactPhone) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const venue = await createVenue({
      name: body.name,
      location: body.location,
      contactName: body.contactName,
      contactEmail: body.contactEmail || '',
      contactPhone: body.contactPhone || '',
      instagram: body.instagram || '',
      description: body.description || '',
      venueType: body.venueType || '',
      capacity: parseInt(body.capacity) || 0,
      dealType: body.dealType || '',
      rate: body.rate || '',
      notes: body.notes || '',
      status: isAdmin ? 'active' : 'pending',
    });
    // Notify admin of new venue registration
    if (!isAdmin) {
      notifyAdminNewVenue(body.name, body.location, body.contactName, body.contactEmail).catch(console.error);
      // Trigger: Venue pending → notify admin push
      notifyVenuePending(body.name, venue.id).catch(() => {});
    }

    return NextResponse.json(venue, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

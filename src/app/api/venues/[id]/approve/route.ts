import { NextRequest, NextResponse } from 'next/server';
import { updateVenue, getVenueById } from '@/lib/db';
import { sendVenueApproved } from '@/lib/email';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const password = request.headers.get('x-admin-key');
  if (password !== 'cercle2024') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const { status } = body;

  if (!['active', 'inactive'].includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  // Find by ID (admin uses internal ID)
  const venues = await import('@/lib/db').then(m => m.getVenues());
  const venue = venues.find(v => v.id === id);
  if (!venue) {
    return NextResponse.json({ error: 'Venue not found' }, { status: 404 });
  }

  const updated = await updateVenue(id, {
    status,
    approvedAt: status === 'active' ? new Date().toISOString() : undefined,
  });

  // Send approval email to venue
  if (status === 'active' && venue.status !== 'active') {
    sendVenueApproved(venue.contactEmail, venue.name, venue.accessCode).catch(console.error);
  }

  return NextResponse.json({ venue: updated });
}

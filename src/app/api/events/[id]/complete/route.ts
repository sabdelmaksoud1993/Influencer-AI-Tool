import { NextRequest, NextResponse } from 'next/server';
import { completeEvent, getVenueByCode, getEventById, getMemberById } from '@/lib/db';
import { sendStrikeWarning } from '@/lib/email';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const adminKey = request.headers.get('x-admin-key');
  const venueCode = request.headers.get('x-venue-code');

  if (adminKey !== 'cercle2024' && !venueCode) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (venueCode) {
    const venue = await getVenueByCode(venueCode);
    if (!venue || venue.status !== 'active') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  // Get event before completion to track no-shows
  const eventBefore = await getEventById(id);
  const confirmedBefore = eventBefore?.rsvps.filter(r => r.status === 'confirmed').map(r => r.memberId) || [];

  const result = await completeEvent(id);
  if (!result) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 });
  }

  // Send strike emails to no-shows
  for (const memberId of confirmedBefore) {
    const member = await getMemberById(memberId);
    if (member?.email) {
      sendStrikeWarning(member.email, member.fullName, (member.strikes || 0), `No-show at ${result.title}`).catch(console.error);
    }
  }

  return NextResponse.json({ event: result, message: 'Event completed. No-shows have been penalized.' });
}

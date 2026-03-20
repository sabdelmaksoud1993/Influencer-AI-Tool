import { NextRequest, NextResponse } from 'next/server';
import { getMemberByCode, getVenueByCode, blockCreator } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const venueCode = request.headers.get('x-venue-code');
  const adminKey = request.headers.get('x-admin-key');

  if (adminKey !== 'cercle2024' && !venueCode) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const member = await getMemberByCode(code);
  if (!member) {
    return NextResponse.json({ error: 'Member not found' }, { status: 404 });
  }

  if (venueCode) {
    const venue = await getVenueByCode(venueCode);
    if (!venue || venue.status !== 'active') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await blockCreator(venue.id, member.id);
    return NextResponse.json({ success: true, message: `${member.fullName} blocked from your venue` });
  }

  return NextResponse.json({ error: 'Venue code required' }, { status: 400 });
}

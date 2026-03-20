import { NextRequest, NextResponse } from 'next/server';
import { getCreatorProfile, getVenueByCode } from '@/lib/db';

// GET full creator profile (for venue review)
export async function GET(
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

  const profile = await getCreatorProfile(id);
  if (!profile) {
    return NextResponse.json({ error: 'Creator not found' }, { status: 404 });
  }

  return NextResponse.json(profile);
}

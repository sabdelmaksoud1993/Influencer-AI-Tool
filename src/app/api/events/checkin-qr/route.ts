import { NextRequest, NextResponse } from 'next/server';
import { checkInByToken, generateCheckInToken, getVenueByCode } from '@/lib/db';

// POST: check in by QR token OR generate token
export async function POST(request: NextRequest) {
  const body = await request.json();

  // Generate a check-in token for a confirmed RSVP
  if (body.action === 'generate') {
    const { eventId, memberId } = body;
    const token = await generateCheckInToken(eventId, memberId);
    if (!token) {
      return NextResponse.json({ error: 'Could not generate token' }, { status: 400 });
    }
    return NextResponse.json({ token, checkInUrl: `/api/events/checkin-qr?token=${token}` });
  }

  // Check in by token
  if (body.token) {
    const result = await checkInByToken(body.token);
    if (!result) {
      return NextResponse.json({ error: 'Invalid or already used token' }, { status: 400 });
    }
    return NextResponse.json({ success: true, event: result.event.title, member: result.memberName });
  }

  return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
}

// GET: check in via QR scan (venue scans the URL)
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');
  const venueCode = request.nextUrl.searchParams.get('venue');

  if (!token) {
    return NextResponse.json({ error: 'Missing token' }, { status: 400 });
  }

  // Verify venue if provided
  if (venueCode) {
    const venue = await getVenueByCode(venueCode);
    if (!venue) {
      return NextResponse.json({ error: 'Invalid venue' }, { status: 401 });
    }
  }

  const result = await checkInByToken(token);
  if (!result) {
    return NextResponse.json({ error: 'Invalid or already used QR code' }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    message: `${result.memberName} checked in to ${result.event.title}`,
    event: result.event.title,
    member: result.memberName,
  });
}

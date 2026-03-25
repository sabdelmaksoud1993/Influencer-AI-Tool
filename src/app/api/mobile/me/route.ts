import { NextResponse } from 'next/server';
import { getTokenFromRequest } from '@/lib/jwt';
import { getMemberByCode, getVenueByCode } from '@/lib/db';

export async function GET(request: Request) {
  const payload = await getTokenFromRequest(request);
  if (!payload) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    if (payload.role === 'member' && payload.accessCode) {
      const member = await getMemberByCode(payload.accessCode);
      if (!member) {
        return NextResponse.json({ error: 'Member not found' }, { status: 404 });
      }
      return NextResponse.json({
        user: {
          id: member.id,
          name: member.fullName,
          role: 'member',
          accessCode: member.accessCode,
          email: member.email,
          instagram: member.instagram,
          tier: member.tier,
          eventsAttended: member.eventsAttended,
          contentScore: member.contentScore,
          reliabilityScore: member.reliabilityScore,
        },
      });
    }

    if (payload.role === 'venue' && payload.accessCode) {
      const venue = await getVenueByCode(payload.accessCode);
      if (!venue) {
        return NextResponse.json({ error: 'Venue not found' }, { status: 404 });
      }
      return NextResponse.json({
        user: {
          id: venue.id,
          name: venue.name,
          role: 'venue',
          accessCode: venue.accessCode,
          venueType: venue.venueType,
          totalEvents: venue.totalEvents,
          totalMembersSent: venue.totalMembersSent,
        },
      });
    }

    if (payload.role === 'admin') {
      return NextResponse.json({
        user: {
          id: 'admin',
          name: 'Admin',
          role: 'admin',
        },
      });
    }

    return NextResponse.json({ error: 'Unknown role' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

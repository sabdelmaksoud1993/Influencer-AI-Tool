import { NextResponse } from 'next/server';
import { getMemberByCode, getVenueByCode } from '@/lib/db';
import { createToken } from '@/lib/jwt';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const code = body.code?.trim();

    if (!code) {
      return NextResponse.json({ error: 'Access code required' }, { status: 400 });
    }

    // Creator login
    if (code.startsWith('CRC-')) {
      const member = await getMemberByCode(code);
      if (!member) {
        return NextResponse.json({ error: 'Invalid access code' }, { status: 401 });
      }
      if (member.status === 'blacklisted') {
        return NextResponse.json({ error: 'Account has been suspended' }, { status: 403 });
      }
      const token = await createToken({
        id: member.id,
        name: member.fullName,
        role: 'member',
        accessCode: member.accessCode,
        email: member.email,
      });
      return NextResponse.json({
        token,
        user: {
          id: member.id,
          name: member.fullName,
          role: 'member',
          accessCode: member.accessCode,
          email: member.email,
          instagram: member.instagram,
          tier: member.tier,
        },
      });
    }

    // Venue login
    if (code.startsWith('VNU-')) {
      const venue = await getVenueByCode(code);
      if (!venue) {
        return NextResponse.json({ error: 'Invalid access code' }, { status: 401 });
      }
      if (venue.status !== 'active') {
        return NextResponse.json({ error: 'Venue not active' }, { status: 403 });
      }
      const token = await createToken({
        id: venue.id,
        name: venue.name,
        role: 'venue',
        accessCode: venue.accessCode,
      });
      return NextResponse.json({
        token,
        user: {
          id: venue.id,
          name: venue.name,
          role: 'venue',
          accessCode: venue.accessCode,
          venueType: venue.venueType,
        },
      });
    }

    // Admin login — password must be set via env var
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (adminPassword && code === adminPassword) {
      const token = await createToken({
        id: 'admin',
        name: 'Admin',
        role: 'admin',
      });
      return NextResponse.json({
        token,
        user: {
          id: 'admin',
          name: 'Admin',
          role: 'admin',
        },
      });
    }

    return NextResponse.json({ error: 'Invalid access code' }, { status: 401 });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

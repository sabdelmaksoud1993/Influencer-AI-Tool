import { NextRequest, NextResponse } from 'next/server';
import { getApplications, createApplication, checkDuplicateApplication } from '@/lib/db';
import { sendApplicationReceived, notifyAdminNewApplication } from '@/lib/email';

export async function GET(request: NextRequest) {
  const password = request.headers.get('x-admin-key');
  if (password !== 'cercle2024') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const apps = await getApplications();
  return NextResponse.json(apps.sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime()));
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fullName, instagram, followerCount, email, phone, city, photos, whyJoin, referredBy, heardFrom } = body;

    if (!fullName || !instagram || !email || !phone || !city) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Duplicate check
    const dupCheck = await checkDuplicateApplication(instagram.replace('@', ''), email);
    if (dupCheck.isDuplicate) {
      return NextResponse.json({ error: dupCheck.reason }, { status: 409 });
    }

    const app = await createApplication({
      fullName,
      instagram: instagram.replace('@', ''),
      followerCount: parseInt(followerCount) || 0,
      email,
      phone,
      city,
      photos: photos || [],
      whyJoin: whyJoin || '',
      referredBy: referredBy || '',
      heardFrom: heardFrom || '',
    });

    // Send emails (non-blocking)
    sendApplicationReceived(email, fullName, instagram.replace('@', '')).catch(console.error);
    notifyAdminNewApplication(fullName, instagram.replace('@', ''), followerCount || '0', email).catch(console.error);

    return NextResponse.json(app, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

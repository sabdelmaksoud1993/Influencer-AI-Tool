import { NextRequest, NextResponse } from 'next/server';
import { getAnalytics } from '@/lib/db';

export async function GET(request: NextRequest) {
  const adminKey = request.headers.get('x-admin-key');
  if (adminKey !== 'cercle2024') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const analytics = await getAnalytics();
  return NextResponse.json(analytics);
}

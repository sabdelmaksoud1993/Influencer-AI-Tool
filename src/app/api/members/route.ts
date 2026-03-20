import { NextRequest, NextResponse } from 'next/server';
import { getMembers } from '@/lib/db';

export async function GET(request: NextRequest) {
  const password = request.headers.get('x-admin-key');
  if (password !== 'cercle2024') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const members = await getMembers();
  return NextResponse.json(members.sort((a, b) => new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime()));
}

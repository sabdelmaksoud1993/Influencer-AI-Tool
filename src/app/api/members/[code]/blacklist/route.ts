import { NextRequest, NextResponse } from 'next/server';
import { getMemberByCode, blacklistMember } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const adminKey = request.headers.get('x-admin-key');

  if (adminKey !== 'cercle2024') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const member = await getMemberByCode(code);
  if (!member) {
    return NextResponse.json({ error: 'Member not found' }, { status: 404 });
  }

  const body = await request.json();
  const result = await blacklistMember(member.id, body.reason || 'Admin action');

  return NextResponse.json({ member: result });
}

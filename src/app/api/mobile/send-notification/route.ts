import { NextResponse } from 'next/server';
import { getTokenFromRequest } from '@/lib/jwt';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface ExpoPushMessage {
  to: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  sound?: string;
}

async function sendExpoPush(messages: ExpoPushMessage[]) {
  const response = await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(messages),
  });
  return response.json();
}

export async function POST(request: Request) {
  const user = await getTokenFromRequest(request);
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Admin only' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { title, message, targetRole, targetUserId } = body;

    if (!title || !message) {
      return NextResponse.json({ error: 'Title and message required' }, { status: 400 });
    }

    // Get push tokens
    let query = supabase.from('push_tokens').select('push_token, user_id, user_role');

    if (targetUserId) {
      query = query.eq('user_id', targetUserId);
    } else if (targetRole && targetRole !== 'all') {
      query = query.eq('user_role', targetRole);
    }

    const { data: tokens } = await query;

    if (!tokens || tokens.length === 0) {
      return NextResponse.json({ error: 'No recipients found' }, { status: 404 });
    }

    const messages: ExpoPushMessage[] = tokens.map((t) => ({
      to: t.push_token,
      title,
      body: message,
      sound: 'default',
      data: { type: 'admin_notification' },
    }));

    const result = await sendExpoPush(messages);

    return NextResponse.json({
      success: true,
      sent: messages.length,
      result,
    });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

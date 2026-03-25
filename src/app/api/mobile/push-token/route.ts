import { NextResponse } from 'next/server';
import { getTokenFromRequest } from '@/lib/jwt';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
  const user = await getTokenFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { pushToken } = body;

    if (!pushToken) {
      return NextResponse.json({ error: 'Push token required' }, { status: 400 });
    }

    // Upsert push token for user
    await supabase
      .from('push_tokens')
      .upsert(
        {
          user_id: user.id,
          user_role: user.role,
          push_token: pushToken,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      );

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

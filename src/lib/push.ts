import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface PushMessage {
  to: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  sound?: string;
}

async function sendExpoPush(messages: PushMessage[]) {
  if (messages.length === 0) return;
  // Expo Push API supports batches of 100
  const chunks = [];
  for (let i = 0; i < messages.length; i += 100) {
    chunks.push(messages.slice(i, i + 100));
  }
  for (const chunk of chunks) {
    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(chunk),
    });
  }
}

// Get push tokens by user ID
async function getTokensByUserId(userId: string): Promise<string[]> {
  const { data } = await supabase
    .from('push_tokens')
    .select('push_token')
    .eq('user_id', userId);
  return (data || []).map((t) => t.push_token);
}

// Get push tokens by role
async function getTokensByRole(role: string): Promise<string[]> {
  const { data } = await supabase
    .from('push_tokens')
    .select('push_token')
    .eq('user_role', role);
  return (data || []).map((t) => t.push_token);
}

// Get all tokens
async function getAllTokens(): Promise<string[]> {
  const { data } = await supabase
    .from('push_tokens')
    .select('push_token');
  return (data || []).map((t) => t.push_token);
}

// ─── Notification Triggers ───────────────────────────────────

// 1. New event created → all creators
export async function notifyNewEvent(eventTitle: string, venueName: string, eventId: string) {
  const tokens = await getTokensByRole('member');
  await sendExpoPush(tokens.map((to) => ({
    to,
    title: 'New Event 🎉',
    body: `${venueName} just posted "${eventTitle}" — RSVP before spots fill up!`,
    sound: 'default',
    data: { type: 'new_event', eventId },
  })));
}

// 2. RSVP confirmed → the creator
export async function notifyRSVPConfirmed(memberId: string, eventTitle: string, eventId: string) {
  const tokens = await getTokensByUserId(memberId);
  await sendExpoPush(tokens.map((to) => ({
    to,
    title: 'RSVP Confirmed ✓',
    body: `You're in! Your RSVP for "${eventTitle}" has been confirmed.`,
    sound: 'default',
    data: { type: 'rsvp_confirmed', eventId },
  })));
}

// 3. Event reminder → all RSVPd creators (called by cron/scheduled task)
export async function notifyEventReminder(
  memberIds: string[],
  eventTitle: string,
  eventId: string,
  hoursUntil: number
) {
  const allTokens: PushMessage[] = [];
  for (const memberId of memberIds) {
    const tokens = await getTokensByUserId(memberId);
    tokens.forEach((to) => {
      allTokens.push({
        to,
        title: hoursUntil <= 2 ? 'Starting Soon! ⏰' : 'Event Tomorrow 📅',
        body: hoursUntil <= 2
          ? `"${eventTitle}" starts in ${hoursUntil}h — get ready!`
          : `Reminder: "${eventTitle}" is tomorrow. Don't forget!`,
        sound: 'default',
        data: { type: 'event_reminder', eventId },
      });
    });
  }
  await sendExpoPush(allTokens);
}

// 4. Check-in window open → RSVPd creators
export async function notifyCheckInOpen(memberIds: string[], eventTitle: string, eventId: string) {
  const allTokens: PushMessage[] = [];
  for (const memberId of memberIds) {
    const tokens = await getTokensByUserId(memberId);
    tokens.forEach((to) => {
      allTokens.push({
        to,
        title: 'Check-In Open 📍',
        body: `"${eventTitle}" check-in is now open. Show your QR code at the door!`,
        sound: 'default',
        data: { type: 'checkin_open', eventId },
      });
    });
  }
  await sendExpoPush(allTokens);
}

// 5. Content deadline → attended creators who haven't submitted
export async function notifyContentDeadline(memberId: string, eventTitle: string, eventId: string) {
  const tokens = await getTokensByUserId(memberId);
  await sendExpoPush(tokens.map((to) => ({
    to,
    title: 'Content Reminder 📸',
    body: `Don't forget to submit your content from "${eventTitle}" — deadline approaching!`,
    sound: 'default',
    data: { type: 'content_deadline', eventId },
  })));
}

// 6. Content verified → the creator
export async function notifyContentVerified(memberId: string, eventTitle: string, eventId: string) {
  const tokens = await getTokensByUserId(memberId);
  await sendExpoPush(tokens.map((to) => ({
    to,
    title: 'Content Approved ✅',
    body: `Your content for "${eventTitle}" has been verified. Great work!`,
    sound: 'default',
    data: { type: 'content_verified', eventId },
  })));
}

// 7. No-show warning → the creator
export async function notifyNoShow(memberId: string, eventTitle: string) {
  const tokens = await getTokensByUserId(memberId);
  await sendExpoPush(tokens.map((to) => ({
    to,
    title: 'No-Show Recorded ⚠️',
    body: `You were marked as a no-show for "${eventTitle}". Repeated no-shows may affect your account.`,
    sound: 'default',
    data: { type: 'no_show' },
  })));
}

// 8. New application → admin
export async function notifyNewApplication(applicantName: string, applicationId: string) {
  const tokens = await getTokensByRole('admin');
  await sendExpoPush(tokens.map((to) => ({
    to,
    title: 'New Application 📋',
    body: `${applicantName} just applied to join Glow Pass.`,
    sound: 'default',
    data: { type: 'new_application', applicationId },
  })));
}

// 9. Venue pending approval → admin
export async function notifyVenuePending(venueName: string, venueId: string) {
  const tokens = await getTokensByRole('admin');
  await sendExpoPush(tokens.map((to) => ({
    to,
    title: 'New Venue Registration 🏢',
    body: `${venueName} has registered and is awaiting approval.`,
    sound: 'default',
    data: { type: 'venue_pending', venueId },
  })));
}

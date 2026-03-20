import { NextRequest, NextResponse } from 'next/server';
import { getMemberByCode, getEvents } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const member = await getMemberByCode(code);

  if (!member) {
    return NextResponse.json({ error: 'Member not found' }, { status: 404 });
  }

  // Get events relevant to this member
  const allEvents = await getEvents();
  const upcomingEvents = allEvents.filter(e => e.status === 'upcoming' || e.status === 'active');
  const myRsvps = allEvents
    .filter(e => e.rsvps.some(r => r.memberId === member.id))
    .map(e => ({
      eventId: e.id,
      eventTitle: e.title,
      venueName: e.venueName,
      date: e.date,
      rsvpStatus: e.rsvps.find(r => r.memberId === member.id)?.status,
    }));

  return NextResponse.json({
    member,
    upcomingEvents: upcomingEvents.map(e => {
      const myRsvp = e.rsvps.find(r => r.memberId === member.id);
      return {
        id: e.id,
        title: e.title,
        venueName: e.venueName,
        date: e.date,
        time: e.time,
        arrivalDeadline: e.arrivalDeadline,
        dressCode: e.dressCode,
        description: e.description,
        perks: e.perks,
        capacity: e.capacity,
        spotsLeft: e.capacity - e.rsvps.filter(r => r.status === 'confirmed' || r.status === 'attended').length,
        myRsvp: myRsvp?.status || null,
        myContentStatus: myRsvp?.contentStatus || null,
        checkInToken: myRsvp?.status === 'confirmed' ? (myRsvp as unknown as Record<string, unknown>).checkInToken as string || null : null,
      };
    }),
    history: myRsvps,
  });
}

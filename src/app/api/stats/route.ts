import { NextRequest, NextResponse } from 'next/server';
import { getApplications, getMembers, getEvents, getVenues } from '@/lib/db';

export async function GET(request: NextRequest) {
  const password = request.headers.get('x-admin-key');
  if (password !== 'cercle2024') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const [apps, members, events, venues] = await Promise.all([
    getApplications(),
    getMembers(),
    getEvents(),
    getVenues(),
  ]);

  const allRsvps = events.flatMap(e => e.rsvps);
  const completedEvents = events.filter(e => e.status === 'completed');
  const avgAttendance = completedEvents.length > 0
    ? completedEvents.reduce((sum, e) => {
        const attended = e.rsvps.filter(r => r.status === 'attended').length;
        const total = e.rsvps.filter(r => ['confirmed', 'attended', 'no_show'].includes(r.status)).length;
        return sum + (total > 0 ? attended / total : 0);
      }, 0) / completedEvents.length * 100
    : 0;

  return NextResponse.json({
    totalApplications: apps.length,
    pendingApplications: apps.filter(a => a.status === 'pending').length,
    totalMembers: members.length,
    activeMembers: members.filter(m => m.status === 'active').length,
    suspendedMembers: members.filter(m => m.status === 'suspended').length,
    blacklistedMembers: members.filter(m => m.status === 'blacklisted').length,
    totalEvents: events.length,
    upcomingEvents: events.filter(e => e.status === 'upcoming').length,
    totalVenues: venues.filter(v => v.status === 'active').length,
    avgAttendanceRate: Math.round(avgAttendance),
    totalNoShows: allRsvps.filter(r => r.status === 'no_show').length,
    totalContentVerified: allRsvps.filter(r => r.contentStatus === 'verified').length,
    avgReliabilityScore: members.length > 0
      ? Math.round(members.reduce((s, m) => s + (m.reliabilityScore ?? 100), 0) / members.length)
      : 100,
  });
}

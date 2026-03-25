import { User, Event, RSVP, Venue, Member, Application, DashboardStats } from '../src/types';

describe('Type definitions', () => {
  it('User type has required fields', () => {
    const user: User = {
      id: '1',
      name: 'Test User',
      role: 'member',
    };
    expect(user.id).toBe('1');
    expect(user.name).toBe('Test User');
    expect(user.role).toBe('member');
  });

  it('User role accepts all valid values', () => {
    const member: User = { id: '1', name: 'M', role: 'member' };
    const venue: User = { id: '2', name: 'V', role: 'venue' };
    const admin: User = { id: '3', name: 'A', role: 'admin' };
    expect(member.role).toBe('member');
    expect(venue.role).toBe('venue');
    expect(admin.role).toBe('admin');
  });

  it('Event type has required fields', () => {
    const event: Event = {
      id: '1',
      venueId: 'v1',
      venueName: 'Test Venue',
      title: 'Friday Night',
      date: '2026-04-01',
      time: '22:00',
      arrivalDeadline: '22:30',
      dressCode: 'Smart Casual',
      description: 'Test event',
      capacity: 50,
      perks: ['Free drinks'],
      status: 'upcoming',
      rsvps: [],
      createdAt: '2026-03-25',
    };
    expect(event.title).toBe('Friday Night');
    expect(event.perks).toHaveLength(1);
  });

  it('RSVP status accepts valid values', () => {
    const rsvp: RSVP = {
      memberId: '1',
      memberName: 'Test',
      status: 'confirmed',
      rsvpAt: '2026-03-25',
    };
    expect(rsvp.status).toBe('confirmed');
  });

  it('DashboardStats has all required fields', () => {
    const stats: DashboardStats = {
      totalApplications: 10,
      pendingApplications: 3,
      totalMembers: 50,
      activeMembers: 45,
      totalEvents: 20,
      upcomingEvents: 5,
      totalVenues: 8,
      avgAttendanceRate: 85,
      totalNoShows: 2,
      totalContentVerified: 100,
      avgReliabilityScore: 90,
    };
    expect(stats.totalMembers).toBe(50);
    expect(stats.avgAttendanceRate).toBe(85);
  });
});

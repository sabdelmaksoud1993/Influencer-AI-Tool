export interface User {
  id: string;
  name: string;
  role: 'member' | 'venue' | 'admin';
  accessCode?: string;
  email?: string;
  instagram?: string;
  tier?: string;
  venueType?: string;
  totalEvents?: number;
  totalMembersSent?: number;
  eventsAttended?: number;
  contentScore?: number;
  reliabilityScore?: number;
}

export interface Event {
  id: string;
  venueId: string;
  venueName: string;
  title: string;
  date: string;
  time: string;
  arrivalDeadline: string;
  dressCode: string;
  description: string;
  capacity: number;
  perks: string[];
  status: 'upcoming' | 'active' | 'ongoing' | 'completed' | 'cancelled';
  rsvps: RSVP[];
  createdAt: string;
}

export interface RSVP {
  memberId: string;
  memberName: string;
  instagram?: string;
  followerCount?: number;
  status: 'pending' | 'confirmed' | 'declined' | 'attended' | 'no_show';
  rsvpAt: string;
  checkedInAt?: string;
  contentProofs?: ContentProof[];
  contentStatus?: 'not_submitted' | 'submitted' | 'verified';
  checkInToken?: string;
}

export interface ContentProof {
  link: string;
  type: 'story' | 'post' | 'reel';
  submittedAt: string;
  verified?: boolean;
}

export interface Venue {
  id: string;
  name: string;
  location: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  instagram: string;
  description: string;
  venueType: string;
  capacity: number;
  accessCode: string;
  totalEvents: number;
  totalMembersSent: number;
  status: 'pending' | 'active' | 'inactive';
}

export interface Member {
  id: string;
  fullName: string;
  instagram: string;
  followerCount: number;
  email: string;
  phone: string;
  city: string;
  accessCode: string;
  tier: string;
  status: 'active' | 'inactive' | 'suspended' | 'blacklisted';
  eventsAttended: number;
  contentScore: number;
  reliabilityScore: number;
  strikes: number;
  noShows: number;
}

export interface Application {
  id: string;
  fullName: string;
  instagram: string;
  followerCount: number;
  email: string;
  phone: string;
  city: string;
  photos: string[];
  whyJoin: string;
  status: 'pending' | 'approved' | 'waitlisted' | 'rejected';
  appliedAt: string;
}

export interface DashboardStats {
  totalApplications: number;
  pendingApplications: number;
  totalMembers: number;
  activeMembers: number;
  totalEvents: number;
  upcomingEvents: number;
  totalVenues: number;
  avgAttendanceRate: number;
  totalNoShows: number;
  totalContentVerified: number;
  avgReliabilityScore: number;
}

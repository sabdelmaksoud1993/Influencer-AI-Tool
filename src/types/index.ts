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
  referredBy: string;
  heardFrom: string;
  status: 'pending' | 'approved' | 'waitlisted' | 'rejected';
  appliedAt: string;
  reviewedAt?: string;
  reviewNote?: string;
}

export interface Member {
  id: string;
  applicationId?: string;
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
  joinedAt: string;
  lastEventAt?: string;
  photos: string[];
  // Accountability
  strikes: number;
  noShows: number;
  reliabilityScore: number; // 0-100
  totalEventsApplied: number;
  totalContentSubmitted: number;
  totalContentVerified: number;
  // Blacklist
  blacklisted?: boolean;
  blacklistedAt?: string;
  blacklistReason?: string;
  // Venue blocks
  blockedByVenues?: string[]; // venue IDs
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
  completedAt?: string;
  templateId?: string;
}

export interface EventTemplate {
  id: string;
  venueId: string;
  venueName: string;
  title: string;
  time: string;
  arrivalDeadline: string;
  dressCode: string;
  description: string;
  capacity: number;
  perks: string[];
  createdAt: string;
}

export interface ContentProof {
  link: string;
  type: 'story' | 'post' | 'reel';
  submittedAt: string;
  verified?: boolean;
  verifiedAt?: string;
  verifiedBy?: 'venue' | 'admin';
}

export interface RSVP {
  memberId: string;
  memberName: string;
  instagram?: string;
  followerCount?: number;
  status: 'pending' | 'confirmed' | 'declined' | 'attended' | 'no_show';
  rsvpAt: string;
  checkedInAt?: string;
  checkedInBy?: string;
  contentProofs?: ContentProof[];
  contentStatus?: 'not_submitted' | 'submitted' | 'verified';
  arrivedAt?: string;
  contentPosted?: boolean;
  checkInToken?: string; // unique QR token
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
  dealType: string;
  rate: string;
  notes: string;
  totalEvents: number;
  totalMembersSent: number;
  status: 'pending' | 'active' | 'inactive';
  createdAt: string;
  approvedAt?: string;
  blockedCreators?: string[]; // member IDs
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

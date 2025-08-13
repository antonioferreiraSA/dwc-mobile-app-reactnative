export interface Sermon {
  id: number;
  title: string;
  speaker: string;
  date: string;
  duration: string;
  series: string;
  audioUrl?: string;
  videoUrl?: string;
  image: string;
  description?: string;
  tags?: string[];
}

export interface Event {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  category: string;
  attendees: number;
  capacity?: number;
  image?: string;
  isRSVPRequired: boolean;
}

export interface PrayerRequest {
  id: number;
  title: string;
  description: string;
  submittedBy: string;
  submittedAt: string;
  isAnonymous: boolean;
  prayerCount: number;
  category: 'health' | 'family' | 'work' | 'spiritual' | 'other';
}

export interface GivingCategory {
  id: number;
  title: string;
  description: string;
  goal: number;
  raised: number;
  progress: number;
  color: string;
}

export interface ChurchMember {
  id: number;
  name: string;
  email: string;
  phone?: string;
  memberSince: string;
  groups: string[];
  profileImage?: string;
}

export interface SmallGroup {
  id: number;
  name: string;
  description: string;
  leader: string;
  meetingTime: string;
  location: string;
  members: number;
  capacity: number;
  category: string;
}
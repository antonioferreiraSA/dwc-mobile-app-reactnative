import { Sermon, Event, PrayerRequest, SmallGroup } from '@/types/church';

export const sampleSermons: Sermon[] = [
  {
    id: 1,
    title: 'Walking in Faith',
    speaker: 'Pastor John Smith',
    date: 'December 15, 2024',
    duration: '32 min',
    series: 'Faith Journey',
    image: 'https://images.pexels.com/photos/372326/pexels-photo-372326.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Exploring what it means to walk by faith and not by sight in our daily lives.',
    tags: ['faith', 'trust', 'christian-living'],
  },
  {
    id: 2,
    title: 'Love Without Limits',
    speaker: 'Pastor Sarah Johnson',
    date: 'December 8, 2024',
    duration: '28 min',
    series: 'Love Series',
    image: 'https://images.pexels.com/photos/289586/pexels-photo-289586.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Understanding the boundless love of God and how we can love others the same way.',
    tags: ['love', 'relationships', 'compassion'],
  },
];

export const sampleEvents: Event[] = [
  {
    id: 1,
    title: 'Christmas Eve Service',
    date: 'December 24, 2024',
    time: '6:00 PM',
    location: 'Main Sanctuary',
    description: 'Join us for a special Christmas Eve service celebrating the birth of Jesus.',
    category: 'Service',
    attendees: 150,
    capacity: 300,
    isRSVPRequired: true,
  },
  {
    id: 2,
    title: 'Youth Group Meeting',
    date: 'December 20, 2024',
    time: '7:00 PM',
    location: 'Fellowship Hall',
    description: 'Weekly youth group meeting with games, worship, and Bible study.',
    category: 'Youth',
    attendees: 25,
    capacity: 50,
    isRSVPRequired: false,
  },
];

export const samplePrayerRequests: PrayerRequest[] = [
  {
    id: 1,
    title: 'Healing for Family Member',
    description: 'Please pray for my grandmother who is recovering from surgery.',
    submittedBy: 'Sarah M.',
    submittedAt: '2024-12-15T10:30:00Z',
    isAnonymous: false,
    prayerCount: 12,
    category: 'health',
  },
  {
    id: 2,
    title: 'Job Search',
    description: 'Seeking God\'s guidance in finding new employment opportunities.',
    submittedBy: 'Anonymous',
    submittedAt: '2024-12-14T15:45:00Z',
    isAnonymous: true,
    prayerCount: 8,
    category: 'work',
  },
];

export const sampleSmallGroups: SmallGroup[] = [
  {
    id: 1,
    name: 'Young Adults Bible Study',
    description: 'A Bible study focused on applying biblical principles to modern life.',
    leader: 'Mike Johnson',
    meetingTime: 'Wednesdays 7:00 PM',
    location: 'Room 201',
    members: 15,
    capacity: 20,
    category: 'Bible Study',
  },
  {
    id: 2,
    name: 'Marriage Ministry',
    description: 'Support and encouragement for married couples.',
    leader: 'Pastor David & Linda Wilson',
    meetingTime: 'Saturdays 6:00 PM',
    location: 'Fellowship Hall',
    members: 8,
    capacity: 12,
    category: 'Marriage',
  },
];
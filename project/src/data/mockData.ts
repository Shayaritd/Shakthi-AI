import type { Mentor, Scholarship, Notification } from '../types';

export const MOCK_USER = {
  id: '1',
  name: 'Anjali',
  role: 'ATHLETE' as const,
  sport: 'Kabaddi',
  state: 'Haryana',
  level: 'State',
  profileComplete: 85,
  avatar: 'https://images.pexels.com/photos/3775566/pexels-photo-3775566.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=1',
};

export const STATS = [
  { label: 'Training Days', value: '24' },
  { label: 'Coach Reviews', value: '12' },
  { label: 'Skill Points', value: '840' },
  { label: 'Badges', value: '6' },
];

export const UPCOMING_TRIALS = [
  {
    id: '1',
    date: { month: 'OCT', day: '14' },
    title: 'SAI National Selection',
    venue: 'Haryana Sports Complex',
  },
  {
    id: '2',
    date: { month: 'NOV', day: '02' },
    title: 'State Junior Championship',
    venue: 'Pune Regional Stadium',
  },
];

export const MENTORS: Mentor[] = [
  {
    id: '1',
    name: 'Priya Sharma',
    specialty: 'Kabaddi Coach',
    sport: 'Kabaddi',
    rating: 4.9,
    reviews: 87,
    verified: true,
    avatar: 'https://images.pexels.com/photos/3756165/pexels-photo-3756165.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&dpr=1',
    experience: '12 years',
    state: 'Haryana',
    bio: 'Former national-level Kabaddi champion with 12 years of coaching experience. Specializes in rural athlete development.',
    matchScore: 96,
  },
  {
    id: '2',
    name: 'Dr. Neha Rao',
    specialty: 'Sports Nutrition',
    sport: 'Multi-sport',
    rating: 4.8,
    reviews: 63,
    verified: true,
    avatar: 'https://images.pexels.com/photos/5905709/pexels-photo-5905709.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&dpr=1',
    experience: '8 years',
    state: 'Maharashtra',
    bio: 'Sports nutritionist specializing in female athlete performance. PhD in Exercise Physiology from LNIPE.',
    matchScore: 89,
  },
  {
    id: '3',
    name: 'Ramesh Kumar',
    specialty: 'Athletics Coach',
    sport: 'Athletics',
    rating: 4.7,
    reviews: 102,
    verified: true,
    avatar: 'https://images.pexels.com/photos/6456261/pexels-photo-6456261.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&dpr=1',
    experience: '15 years',
    state: 'Rajasthan',
    bio: 'SAI certified coach with 15 years coaching national-level sprinters and long-distance runners.',
    matchScore: 82,
  },
  {
    id: '4',
    name: 'Sunita Devi',
    specialty: 'Wrestling Coach',
    sport: 'Wrestling',
    rating: 4.9,
    reviews: 55,
    verified: true,
    avatar: 'https://images.pexels.com/photos/3823039/pexels-photo-3823039.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&dpr=1',
    experience: '10 years',
    state: 'Haryana',
    bio: 'National gold medalist turned coach. Passionate about developing girls\' wrestling talent from grassroots.',
    matchScore: 91,
  },
];

export const SCHOLARSHIPS: Scholarship[] = [
  {
    id: '1',
    title: 'Tata Sports Foundation National Merit Scholarship',
    provider: 'Tata Sports Foundation',
    amount: '₹50,000/yr',
    deadline: 'Oct 24, 2024',
    sport: 'Wrestling, Archery',
    eligibility: 'Income < 3L',
    matchScore: 95,
    status: 'open',
    description: 'Annual scholarship for rural athletes with demonstrated merit at state level and above.',
    logo: 'https://images.pexels.com/photos/6646918/pexels-photo-6646918.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&dpr=1',
    applicants: 120,
  },
  {
    id: '2',
    title: 'Reliance Foundation Olympic Dreams Grant',
    provider: 'Reliance Foundation',
    amount: '₹1,20,000/yr',
    deadline: 'Nov 15, 2024',
    sport: 'Multi-sport',
    eligibility: 'State Level+',
    matchScore: 88,
    status: 'open',
    description: 'High-value grant supporting India\'s next generation of Olympic hopefuls across all sports.',
    logo: 'https://images.pexels.com/photos/7616610/pexels-photo-7616610.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&dpr=1',
    applicants: 340,
  },
  {
    id: '3',
    title: 'Reliance Foundation Youth Grant',
    provider: 'Reliance Foundation',
    amount: '₹50,000',
    deadline: 'Dec 01, 2024',
    sport: 'All Sports',
    eligibility: 'Rural athletes, state-level participation',
    matchScore: 92,
    status: 'open',
    description: 'Specifically for rural athletes with state-level participation.',
    applicants: 89,
  },
  {
    id: '4',
    title: 'Khelo India Talent Scholarship',
    provider: 'Government of India',
    amount: '₹25,000',
    deadline: 'Dec 15, 2024',
    sport: 'All Sports',
    eligibility: 'District-level and above',
    matchScore: 78,
    status: 'closing_soon',
    description: 'Annual stipend for regional training excellence and kit support.',
    applicants: 580,
  },
];

export const LIVE_APPLICATIONS = [
  {
    id: '1',
    name: 'JSW Sports Excellence',
    status: 'In Review',
    stage: 'Stage 3/4: Verification of Certificates',
    progress: 75,
    color: '#f5a623',
  },
  {
    id: '2',
    name: 'Khelo India Support',
    status: 'Shortlisted',
    stage: 'Final Interview scheduled for Sept 30',
    progress: 90,
    color: '#1a7a6e',
  },
  {
    id: '3',
    name: 'GoSports Foundation',
    status: 'Submitted',
    stage: 'Initial processing started',
    progress: 25,
    color: '#94a3b8',
  },
];

export const NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    title: 'New Scholarship Match',
    message: '2 new scholarships match your profile',
    type: 'success',
    read: false,
    time: '2h ago',
  },
  {
    id: '2',
    title: 'Mentor Request',
    message: 'Priya Sharma accepted your connection request',
    type: 'info',
    read: false,
    time: '1d ago',
  },
  {
    id: '3',
    title: 'Trial Reminder',
    message: 'SAI National Selection in 5 days',
    type: 'warning',
    read: true,
    time: '2d ago',
  },
];

export const STATES = [
  'Andhra Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Delhi', 'Gujarat',
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala',
  'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Mizoram', 'Nagaland',
  'Odisha', 'Punjab', 'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh',
  'Uttarakhand', 'West Bengal',
];

export const SPORTS = [
  'Kabaddi', 'Wrestling', 'Athletics', 'Boxing', 'Hockey', 'Archery',
  'Badminton', 'Football', 'Volleyball', 'Kho Kho', 'Swimming', 'Judo',
  'Weightlifting', 'Shooting', 'Tennis', 'Cricket',
];

export const SAFETY_RESOURCES = [
  {
    id: '1',
    title: '24/7 Support Line',
    description: 'Encrypted reporting and immediate assistance for athletes.',
    icon: 'shield',
    urgent: true,
  },
  {
    id: '2',
    title: 'Report Misconduct',
    description: 'Anonymous, secure reporting of unsafe behavior.',
    icon: 'flag',
    urgent: false,
  },
  {
    id: '3',
    title: 'Legal Resources',
    description: 'Know your rights as an athlete and student.',
    icon: 'book',
    urgent: false,
  },
  {
    id: '4',
    title: 'Counseling Support',
    description: 'Connect with trained counselors confidentially.',
    icon: 'heart',
    urgent: false,
  },
];

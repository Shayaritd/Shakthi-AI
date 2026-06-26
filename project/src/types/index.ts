export type Screen =
  | 'landing'
  | 'login'
  | 'register'
  | 'dashboard'
  | 'mentors'
  | 'grants'
  | 'safety'
  | 'profile'
  | 'ai-assistant';

export type Role = 'ATHLETE' | 'MENTOR' | 'GUARDIAN' | 'COACH' | 'SPONSOR' | 'ADMIN';

export type Tab = 'home' | 'mentors' | 'grants' | 'safety' | 'profile';

export interface User {
  id: string;
  name: string;
  role: Role;
  sport: string;
  state: string;
  level: string;
  profileComplete: number;
  avatar?: string;
}

export interface Mentor {
  id: string;
  name: string;
  specialty: string;
  sport: string;
  rating: number;
  reviews: number;
  verified: boolean;
  avatar: string;
  experience: string;
  state: string;
  bio: string;
  matchScore?: number;
}

export interface Scholarship {
  id: string;
  title: string;
  provider: string;
  amount: string;
  deadline: string;
  sport: string;
  eligibility: string;
  matchScore: number;
  status: 'open' | 'closing_soon' | 'closed';
  description: string;
  logo?: string;
  applicants?: number;
}

export interface College {
  id: string;
  name: string;
  state: string;
  sport: string;
  quotaSeats: number;
  facilities: string[];
  fitScore?: number;
}

export interface SafetyReport {
  id: string;
  type: string;
  description: string;
  status: 'pending' | 'reviewing' | 'resolved';
  createdAt: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success';
  read: boolean;
  time: string;
}

export interface AiResponse {
  success: boolean;
  message: string;
  data: Record<string, unknown>;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export type UserRole = 'ATHLETE' | 'MENTOR' | 'GUARDIAN' | 'ADMIN' | 'COLLEGE_REP' | 'SPONSOR';
export type AthleteLevel = 'SCHOOL' | 'DISTRICT' | 'STATE' | 'NATIONAL' | 'INTERNATIONAL';
export type RequestStatus = 'PENDING' | 'PENDING_GUARDIAN' | 'APPROVED' | 'REJECTED' | 'COMPLETED' | 'CANCELLED';
export type MentorshipMode = 'ONLINE' | 'OFFLINE' | 'GROUP' | 'CAREER_GUIDANCE' | 'TRIAL_PREP';
export type ReportCategory = 'HARASSMENT' | 'INAPPROPRIATE_LANGUAGE' | 'FRAUD' | 'UNSAFE_MEETING' | 'PRESSURE' | 'DISCRIMINATION' | 'MISUSE_CONTENT' | 'SAFETY_CONCERN' | 'OTHER';
export type ReportSeverity = 'NORMAL' | 'URGENT' | 'EMERGENCY';
export type ReportStatus = 'SUBMITTED' | 'UNDER_REVIEW' | 'ESCALATED' | 'RESOLVED' | 'DISMISSED';
export type ScholarshipStatus = 'SAVED' | 'APPLYING' | 'SUBMITTED' | 'SHORTLISTED' | 'APPROVED' | 'REJECTED';
export type NotificationType = 'MENTORSHIP' | 'SCHOLARSHIP' | 'REPORT' | 'VERIFICATION' | 'REWARD' | 'ADMIN' | 'CHAT' | 'REMINDER';
export type OpportunityType = 'TOURNAMENT' | 'TRIAL' | 'CAMP' | 'GOVERNMENT_SCHEME' | 'ACADEMY' | 'SCHOLARSHIP';
export type ContentType = 'VIDEO' | 'ARTICLE' | 'GUIDE' | 'EXERCISE' | 'NUTRITION' | 'MENTAL_HEALTH';

export interface Profile {
  id: string;
  full_name: string;
  phone?: string;
  role: UserRole;
  verified: boolean;
  is_active: boolean;
  preferred_language: string;
  avatar_url?: string;
  district?: string;
  state?: string;
  created_at: string;
  updated_at: string;
}

export interface Achievement {
  title: string;
  event: string;
  level: string;
  year: number;
  medal?: string;
  certificate_url?: string;
}

export interface AthleteProfile {
  id: string;
  user_id: string;
  sport?: string;
  position?: string;
  district?: string;
  state?: string;
  level: AthleteLevel;
  achievements: Achievement[];
  video_urls: string[];
  goals?: string;
  bio?: string;
  guardian_name?: string;
  guardian_phone?: string;
  guardian_email?: string;
  guardian_user_id?: string;
  date_of_birth?: string;
  profile_completion: number;
  visibility_settings: {
    showProfile: boolean;
    showAchievements: boolean;
    showContact: boolean;
  };
  badges: string[];
  created_at: string;
  updated_at: string;
  profile?: Profile;
}

export interface MentorProfile {
  id: string;
  user_id: string;
  expertise: string[];
  experience_years: number;
  verified: boolean;
  certifications: {
    name: string;
    issuer: string;
    year: number;
    certificate_url?: string;
  }[];
  languages: string[];
  trust_score: number;
  availability: string[];
  training_philosophy?: string;
  code_of_conduct_accepted: boolean;
  response_time_hours: number;
  total_reviews: number;
  average_rating: number;
  district?: string;
  state?: string;
  bio?: string;
  created_at: string;
  updated_at: string;
  profile?: Profile;
}

export interface Scholarship {
  id: string;
  name: string;
  provider: string;
  amount: number;
  eligibility?: string;
  deadline?: string;
  state?: string;
  sport?: string;
  girls_only: boolean;
  hostel_support: boolean;
  application_mode?: string;
  description?: string;
  application_url?: string;
  required_level?: string;
  min_age?: number;
  max_age?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  match_score?: number;
}

export interface SavedScholarship {
  id: string;
  user_id: string;
  scholarship_id: string;
  status: ScholarshipStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
  scholarship: Scholarship;
}

export interface MentorshipRequest {
  id: string;
  athlete_id: string;
  mentor_id: string;
  guardian_id?: string;
  status: RequestStatus;
  goal?: string;
  mode: MentorshipMode;
  message?: string;
  guardian_approved: boolean;
  guardian_approved_at?: string;
  start_date?: string;
  end_date?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
  athlete?: Profile & { athlete_profile?: AthleteProfile };
  mentor?: Profile & { mentor_profile?: MentorProfile };
  guardian?: Profile;
}

export interface SafetyReport {
  id: string;
  ticket_id: string;
  reporter_id: string;
  reported_user_id?: string;
  category: ReportCategory;
  severity: ReportSeverity;
  description: string;
  anonymous: boolean;
  evidence_urls: string[];
  status: ReportStatus;
  assigned_to?: string;
  resolution_notes?: string;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
  reported_user?: Profile;
}

export interface College {
  id: string;
  name: string;
  location?: string;
  state?: string;
  sports_quota: boolean;
  fee_concession: number;
  hostel: boolean;
  supported_sports: string[];
  quota_rules?: string;
  required_achievement_level?: string;
  academic_streams: string[];
  last_date?: string;
  website_url?: string;
  contact_email?: string;
  contact_phone?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Opportunity {
  id: string;
  title: string;
  type: OpportunityType;
  organization?: string;
  location?: string;
  state?: string;
  deadline?: string;
  event_date?: string;
  description?: string;
  sport?: string;
  women_focused: boolean;
  age_min?: number;
  age_max?: number;
  registration_url?: string;
  contact_email?: string;
  contact_phone?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TrainingResource {
  id: string;
  title: string;
  category: string;
  content_type: ContentType;
  content?: string;
  video_url?: string;
  author?: string;
  created_by?: string;
  duration_minutes?: number;
  view_count: number;
  is_published: boolean;
  sport?: string;
  thumbnail_url?: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface MentorReview {
  id: string;
  mentor_id: string;
  athlete_id: string;
  mentorship_request_id?: string;
  respectful: number;
  helpful: number;
  knowledgeable: number;
  safe_communication: number;
  punctual: number;
  comment?: string;
  private_safety_flag: boolean;
  moderated: boolean;
  visible: boolean;
  created_at: string;
  updated_at: string;
}

export interface ChatThread {
  id: string;
  athlete_id: string;
  mentor_id: string;
  mentorship_request_id?: string;
  guardian_visible: boolean;
  is_active: boolean;
  is_blocked: boolean;
  blocked_by?: string;
  blocked_reason?: string;
  last_message_at: string;
  created_at: string;
  updated_at: string;
  athlete?: Profile;
  mentor?: Profile;
}

export interface ChatMessage {
  id: string;
  thread_id: string;
  sender_id: string;
  content: string;
  read: boolean;
  read_at?: string;
  attachment_urls: string[];
  moderation_flag: boolean;
  moderation_reason?: string;
  guardian_visible: boolean;
  is_system_message: boolean;
  created_at: string;
  sender?: Profile;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  read_at?: string;
  extra_data: Record<string, unknown>;
  action_url?: string;
  created_at: string;
}

export interface SuccessStory {
  id: string;
  athlete_id: string;
  title: string;
  story: string;
  achievement?: string;
  featured: boolean;
  approved: boolean;
  image_url?: string;
  created_at: string;
  updated_at: string;
  athlete?: Profile & { athlete_profile?: AthleteProfile };
}

export interface DashboardStats {
  total_athletes: number;
  total_mentors: number;
  verified_mentors: number;
  total_scholarships: number;
  active_requests: number;
  pending_reports: number;
  total_opportunities: number;
}

export interface AthleteDashboard {
  profile_completion: number;
  active_mentorships: number;
  saved_scholarships: number;
  upcoming_events: number;
  recommended_mentors: MentorProfile[];
  matched_scholarships: Scholarship[];
  recent_notifications: Notification[];
}

export interface MentorDashboard {
  verified: boolean;
  active_mentorships: number;
  pending_requests: number;
  total_reviews: number;
  average_rating: number;
  recent_requests: MentorshipRequest[];
}

export interface GuardianDashboard {
  linked_athletes: AthleteProfile[];
  pending_approvals: MentorshipRequest[];
  recent_chats: ChatThread[];
}

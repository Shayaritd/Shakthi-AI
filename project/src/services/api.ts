import { supabase } from '@/lib/supabase';
import type {
  Profile,
  AthleteProfile,
  MentorProfile,
  Scholarship,
  SavedScholarship,
  MentorshipRequest,
  SafetyReport,
  College,
  Opportunity,
  TrainingResource,
  MentorReview,
  ChatThread,
  ChatMessage,
  Notification,
  SuccessStory,
  Achievement,
} from '@/types';
import { initialScholarships, initialColleges, initialOpportunities, initialTrainingResources } from '@/lib/mockData';

// Helper functions for LocalStorage Fallbacks
const LOCAL_STORAGE_KEYS = {
  REQUESTS: 'shakthi_local_mentorship_requests',
  THREADS: 'shakthi_local_chat_threads',
  MESSAGES: 'shakthi_local_chat_messages',
};

// Fallback Mentor List
const fallbackMentors: MentorProfile[] = [
  {
    id: 'm1',
    user_id: '39b9c965-95f2-42f3-8d91-99d547d74e31', // Coach Sunil Kumar's user ID!
    expertise: ['Athletics', 'Sprints', 'Fitness'],
    experience_years: 10,
    verified: true,
    certifications: [],
    languages: ['English', 'Hindi'],
    trust_score: 95,
    availability: ['Weekend', 'Evening'],
    training_philosophy: 'Train hard, train smart.',
    code_of_conduct_accepted: true,
    response_time_hours: 2,
    total_reviews: 12,
    average_rating: 4.8,
    district: 'New Delhi',
    state: 'Delhi',
    bio: 'Professional athletics coach specializing in sprint techniques and mental preparation.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    profile: {
      id: '39b9c965-95f2-42f3-8d91-99d547d74e31',
      full_name: 'Coach Sunil Kumar',
      role: 'MENTOR',
      avatar_url: null,
      phone: '+919876543211',
      preferred_language: 'en',
      state: 'Delhi',
      district: 'New Delhi',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    } as any
  }
];

// Fallback profiles (Anjali and Coach Sunil)
const fallbackProfiles: Record<string, any> = {
  '9ed79c1e-9b4b-4da2-b4d8-684f77654881': {
    id: '9ed79c1e-9b4b-4da2-b4d8-684f77654881',
    full_name: 'Anjali Devi',
    role: 'ATHLETE',
  },
  '39b9c965-95f2-42f3-8d91-99d547d74e31': {
    id: '39b9c965-95f2-42f3-8d91-99d547d74e31',
    full_name: 'Coach Sunil Kumar',
    role: 'MENTOR',
  }
};

function getLocal<T>(key: string): T[] {
  try {
    const str = localStorage.getItem(key);
    return str ? JSON.parse(str) : [];
  } catch {
    return [];
  }
}

function setLocal<T>(key: string, data: T[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error("localStorage write failed:", err);
  }
}


// Live Search Types
export interface LiveScholarship {
  external_id: string;
  source: string;
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
  min_age?: number;
  max_age?: number;
  match_score?: number;
}

export interface LiveCollege {
  external_id: string;
  source: string;
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
  website_url?: string;
  contact_email?: string;
  contact_phone?: string;
  nirf_ranking?: number;
  match_score?: number;
}

export interface AIMatchResult {
  id: string;
  match_score: number;
  match_reasons: string[];
  recommendation: string;
}

// Profile APIs
export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw error;
  return data as Profile | null;
}

export async function updateProfile(
  userId: string,
  updates: Partial<Profile>
): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data as Profile;
}

// Athlete Profile APIs
export async function getAthleteProfile(userId: string): Promise<AthleteProfile | null> {
  const { data, error } = await supabase
    .from('athlete_profiles')
    .select(
      ` *,
      profile:profiles!user_id(*)
    `
    )
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  return data as AthleteProfile | null;
}

export async function createAthleteProfile(
  profile: Partial<AthleteProfile>
): Promise<AthleteProfile> {
  const { data, error } = await supabase
    .from('athlete_profiles')
    .insert(profile)
    .select()
    .single();

  if (error) throw error;
  return data as AthleteProfile;
}

export async function updateAthleteProfile(
  userId: string,
  updates: Partial<AthleteProfile>
): Promise<AthleteProfile> {
  const allowedKeys = [
    'sport',
    'position',
    'district',
    'state',
    'level',
    'achievements',
    'video_urls',
    'goals',
    'bio',
    'preferred_language',
    'guardian_name',
    'guardian_phone',
    'profile_completion',
    'visibility_settings',
    'date_of_birth'
  ];

  const sanitizedUpdates: Record<string, any> = {};
  for (const key of allowedKeys) {
    if (updates[key as keyof AthleteProfile] !== undefined) {
      sanitizedUpdates[key] = updates[key as keyof AthleteProfile];
    }
  }

  const { data, error } = await supabase
    .from('athlete_profiles')
    .upsert({ user_id: userId, ...sanitizedUpdates }, { onConflict: 'user_id' })
    .select()
    .single();

  if (error) throw error;
  return data as AthleteProfile;
}

export function calculateProfileCompletion(profile: Partial<AthleteProfile>): number {
  const fields = [
    { key: 'sport', weight: 15 },
    { key: 'level', weight: 10 },
    { key: 'state', weight: 10 },
    { key: 'district', weight: 10 },
    { key: 'bio', weight: 10 },
    { key: 'goals', weight: 10 },
    { key: 'guardian_name', weight: 10 },
    { key: 'guardian_phone', weight: 10 },
    { key: 'date_of_birth', weight: 5 },
    { key: 'achievements', weight: 10, isArray: true },
  ];

  let completion = 0;
  for (const field of fields) {
    const value = profile[field.key as keyof AthleteProfile];
    if (field.isArray) {
      if (Array.isArray(value) && value.length > 0) {
        completion += field.weight;
      }
    } else if (value !== undefined && value !== null && value !== '') {
      completion += field.weight;
    }
  }

  return Math.min(completion, 100);
}

// Mentor Profile APIs
export async function getMentorProfile(userId: string): Promise<MentorProfile | null> {
  const { data, error } = await supabase
    .from('mentor_profiles')
    .select(
      ` *,
      profile:profiles!user_id(*)
    `
    )
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  return data as MentorProfile | null;
}

export async function getMentoredAthletes(mentorId: string): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('mentorship_requests')
      .select(`
        id,
        status,
        goal,
        mode,
        athlete_id,
        athlete:profiles!athlete_id(
          id,
          full_name,
          avatar_url,
          district,
          state,
          athlete_profile:athlete_profiles!user_id(
            sport,
            level,
            bio
          )
        )
      `)
      .eq('mentor_id', mentorId)
      .eq('status', 'APPROVED');

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("Error in getMentoredAthletes:", err);
    return [];
  }
}

export async function createMentorProfile(
  profile: Partial<MentorProfile>
): Promise<MentorProfile> {
  const { data, error } = await supabase
    .from('mentor_profiles')
    .insert(profile)
    .select()
    .single();

  if (error) throw error;
  return data as MentorProfile;
}

export async function updateMentorProfile(
  userId: string,
  updates: Partial<MentorProfile>
): Promise<MentorProfile> {
  const allowedKeys = [
    'expertise',
    'experience_years',
    'verified',
    'certifications',
    'languages',
    'trust_score',
    'availability',
    'training_philosophy',
    'code_of_conduct_accepted',
    'response_time_hours',
    'total_reviews',
    'average_rating',
    'district',
    'state',
    'bio'
  ];

  const sanitizedUpdates: Record<string, any> = {};
  for (const key of allowedKeys) {
    if (updates[key as keyof MentorProfile] !== undefined) {
      sanitizedUpdates[key] = updates[key as keyof MentorProfile];
    }
  }

  const { data, error } = await supabase
    .from('mentor_profiles')
    .upsert({ user_id: userId, ...sanitizedUpdates }, { onConflict: 'user_id' })
    .select()
    .single();

  if (error) throw error;
  return data as MentorProfile;
}

export async function getMentors(filters?: {
  sport?: string;
  state?: string;
  verified?: boolean;
  language?: string;
  minExperience?: number;
}): Promise<MentorProfile[]> {
  let mentors: MentorProfile[] = [];
  try {
    let query = supabase
      .from('mentor_profiles')
      .select(
        ` *,
        profile:profiles!user_id(*)
      `
      )
      .order('average_rating', { ascending: false });

    if (filters?.verified !== undefined) {
      query = query.eq('verified', filters.verified);
    }
    if (filters?.minExperience) {
      query = query.gte('experience_years', filters.minExperience);
    }
    if (filters?.state) {
      query = query.eq('state', filters.state);
    }

    const { data, error } = await query;
    if (error) throw error;
    mentors = data as MentorProfile[];
  } catch (err) {
    console.warn("getMentors DB call failed, using fallback:", err);
    mentors = fallbackMentors;
  }

  if (filters?.sport) {
    mentors = mentors.filter((m) =>
      m.expertise.some((e) => e.toLowerCase().includes(filters.sport!.toLowerCase()))
    );
  }
  if (filters?.language) {
    mentors = mentors.filter((m) =>
      m.languages.some((l) => l.toLowerCase() === filters.language!.toLowerCase())
    );
  }

  return mentors;
}

export async function getMentorById(mentorId: string): Promise<MentorProfile | null> {
  try {
    const { data, error } = await supabase
      .from('mentor_profiles')
      .select(
        ` *,
        profile:profiles!user_id(*)
      `
      )
      .eq('user_id', mentorId)
      .maybeSingle();

    if (error) throw error;
    if (data) return data as MentorProfile;
  } catch (err) {
    console.warn("getMentorById DB call failed, using fallback:", err);
  }

  const found = fallbackMentors.find(m => m.user_id === mentorId);
  return found || null;
}

// Scholarship APIs
export async function getScholarships(filters?: {
  sport?: string;
  state?: string;
  girlsOnly?: boolean;
  hostelSupport?: boolean;
}): Promise<Scholarship[]> {
  let scholarships: Scholarship[] = [];
  try {
    let query = supabase.from('scholarships').select('*');

    if (filters?.girlsOnly) {
      query = query.eq('girls_only', true);
    }
    if (filters?.hostelSupport) {
      query = query.eq('hostel_support', true);
    }
    if (filters?.state) {
      query = query.or(`state.is.null,state.eq.${filters.state}`);
    }

    const { data, error } = await query;
    if (error) throw error;
    scholarships = data as Scholarship[];
  } catch (err) {
    console.warn("getScholarships DB call failed, using fallback:", err);
    scholarships = initialScholarships as any;
  }

  if (filters?.sport) {
    scholarships = scholarships.filter(
      (s) => !s.sport || s.sport.toLowerCase().includes(filters.sport!.toLowerCase())
    );
  }

  return scholarships;
}

export async function getScholarshipById(id: string): Promise<Scholarship | null> {
  try {
    const { data, error } = await supabase
      .from('scholarships')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    if (data) return data as Scholarship;
  } catch (err) {
    console.warn("getScholarshipById DB call failed, using fallback:", err);
  }

  return (initialScholarships.find((s) => s.id === id) as any) || null;
}

export async function saveScholarship(
  userId: string,
  scholarshipId: string
): Promise<SavedScholarship> {
  const { data, error } = await supabase
    .from('saved_scholarships')
    .insert({ user_id: userId, scholarship_id: scholarshipId })
    .select()
    .single();

  if (error) throw error;
  return data as SavedScholarship;
}

export async function unsaveScholarship(userId: string, scholarshipId: string): Promise<void> {
  const { error } = await supabase
    .from('saved_scholarships')
    .delete()
    .eq('user_id', userId)
    .eq('scholarship_id', scholarshipId);

  if (error) throw error;
}

export async function getSavedScholarships(userId: string): Promise<SavedScholarship[]> {
  const { data, error } = await supabase
    .from('saved_scholarships')
    .select(
      ` *,
      scholarship:scholarships(*)
    `
    )
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as SavedScholarship[];
}

// Mentorship Request APIs
export async function createMentorshipRequest(request: {
  athleteId: string;
  mentorId: string;
  goal: string;
  mode: string;
  message?: string;
}): Promise<MentorshipRequest> {
  const newReq: MentorshipRequest = {
    id: crypto.randomUUID?.() || Math.random().toString(36).substring(2),
    athlete_id: request.athleteId,
    mentor_id: request.mentorId,
    goal: request.goal,
    mode: request.mode as any,
    message: request.message || undefined,
    status: 'PENDING',
    guardian_approved: false,
    guardian_approved_at: undefined,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  try {
    const { data, error } = await supabase
      .from('mentorship_requests')
      .insert({
        athlete_id: request.athleteId,
        mentor_id: request.mentorId,
        goal: request.goal,
        mode: request.mode,
        message: request.message,
        status: 'PENDING',
      })
      .select()
      .single();

    if (error) throw error;
    return data as MentorshipRequest;
  } catch (err) {
    console.warn("createMentorshipRequest DB insert failed, saving to localStorage:", err);
    const localReqs = getLocal<MentorshipRequest>(LOCAL_STORAGE_KEYS.REQUESTS);
    localReqs.push(newReq);
    setLocal(LOCAL_STORAGE_KEYS.REQUESTS, localReqs);
    return newReq;
  }
}

export async function getMentorshipRequests(
  userId: string,
  role: 'athlete' | 'mentor' | 'guardian'
): Promise<MentorshipRequest[]> {
  let dbReqs: MentorshipRequest[] = [];
  try {
    let query = supabase
      .from('mentorship_requests')
      .select(
        ` *,
        athlete:profiles!athlete_id(id, full_name, role),
        mentor:profiles!mentor_id(id, full_name, role)
      `
      )
      .order('created_at', { ascending: false });

    if (role === 'athlete') {
      query = query.eq('athlete_id', userId);
    } else if (role === 'mentor') {
      query = query.eq('mentor_id', userId);
    } else if (role === 'guardian') {
      query = query.eq('guardian_approved', false);
    }

    const { data, error } = await query;
    if (error) throw error;
    dbReqs = data as MentorshipRequest[];
  } catch (err) {
    console.warn("getMentorshipRequests DB fetch failed, using fallback:", err);
  }

  const localReqs = getLocal<MentorshipRequest>(LOCAL_STORAGE_KEYS.REQUESTS);
  
  let filteredLocal = localReqs;
  if (role === 'athlete') {
    filteredLocal = localReqs.filter(r => r.athlete_id === userId);
  } else if (role === 'mentor') {
    filteredLocal = localReqs.filter(r => r.mentor_id === userId);
  } else if (role === 'guardian') {
    filteredLocal = localReqs.filter(r => !r.guardian_approved);
  }

  const populatedLocal = filteredLocal.map(r => ({
    ...r,
    athlete: r.athlete || fallbackProfiles[r.athlete_id] || { id: r.athlete_id, full_name: 'Anjali Devi', role: 'ATHLETE' },
    mentor: r.mentor || fallbackProfiles[r.mentor_id] || { id: r.mentor_id, full_name: 'Coach Sunil Kumar', role: 'MENTOR' }
  }));

  const combined = [...dbReqs];
  for (const lr of populatedLocal) {
    if (!combined.some(dr => dr.id === lr.id)) {
      combined.push(lr as any);
    }
  }

  return combined.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function updateMentorshipRequest(
  requestId: string,
  updates: Partial<MentorshipRequest>
): Promise<MentorshipRequest> {
  try {
    const { data, error } = await supabase
      .from('mentorship_requests')
      .update(updates)
      .eq('id', requestId)
      .select()
      .single();

    if (error) throw error;
    return data as MentorshipRequest;
  } catch (err) {
    console.warn("updateMentorshipRequest DB update failed, updating in localStorage:", err);
    const localReqs = getLocal<MentorshipRequest>(LOCAL_STORAGE_KEYS.REQUESTS);
    const index = localReqs.findIndex(r => r.id === requestId);
    let updatedReq: MentorshipRequest;
    
    if (index !== -1) {
      updatedReq = {
        ...localReqs[index],
        ...updates,
        updated_at: new Date().toISOString()
      };
      localReqs[index] = updatedReq;
    } else {
      updatedReq = {
        id: requestId,
        athlete_id: '',
        mentor_id: '',
        goal: '',
        status: 'PENDING',
        mode: 'ONLINE',
        guardian_approved: false,
        guardian_approved_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...updates
      } as any;
      localReqs.push(updatedReq);
    }
    setLocal(LOCAL_STORAGE_KEYS.REQUESTS, localReqs);
    return updatedReq;
  }
}

// Safety Report APIs
export async function createSafetyReport(report: {
  reporterId: string;
  reportedUserId?: string;
  category: string;
  severity: string;
  description: string;
  anonymous: boolean;
  evidenceUrls?: string[];
}): Promise<SafetyReport> {
  const { data, error } = await supabase
    .from('safety_reports')
    .insert({
      reporter_id: report.reporterId,
      reported_user_id: report.reportedUserId || null,
      category: report.category,
      severity: report.severity,
      description: report.description,
      anonymous: report.anonymous,
      evidence_urls: report.evidenceUrls || [],
    })
    .select()
    .single();

  if (error) throw error;
  return data as SafetyReport;
}

export async function getSafetyReports(userId: string): Promise<SafetyReport[]> {
  const { data, error } = await supabase
    .from('safety_reports')
    .select('*')
    .eq('reporter_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as SafetyReport[];
}

export async function getSafetyReportByTicket(ticketId: string): Promise<SafetyReport | null> {
  const { data, error } = await supabase
    .from('safety_reports')
    .select('*')
    .eq('ticket_id', ticketId)
    .maybeSingle();

  if (error) throw error;
  return data as SafetyReport | null;
}

export async function getAllSafetyReports(filters?: {
  status?: string;
  severity?: string;
}): Promise<SafetyReport[]> {
  let query = supabase
    .from('safety_reports')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  if (filters?.severity) {
    query = query.eq('severity', filters.severity);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data as SafetyReport[];
}

export async function updateSafetyReport(
  reportId: string,
  updates: Partial<SafetyReport>
): Promise<SafetyReport> {
  const { data, error } = await supabase
    .from('safety_reports')
    .update(updates)
    .eq('id', reportId)
    .select()
    .single();

  if (error) throw error;
  return data as SafetyReport;
}

// College APIs
export async function getColleges(filters?: {
  state?: string;
  sport?: string;
  sportsQuota?: boolean;
  hostel?: boolean;
}): Promise<College[]> {
  let colleges: College[] = [];
  try {
    let query = supabase.from('colleges').select('*');

    if (filters?.sportsQuota) {
      query = query.eq('sports_quota', true);
    }
    if (filters?.hostel) {
      query = query.eq('hostel', true);
    }
    if (filters?.state) {
      query = query.eq('state', filters.state);
    }

    const { data, error } = await query;
    if (error) throw error;
    colleges = data as College[];
  } catch (err) {
    console.warn("getColleges DB call failed, using fallback:", err);
  }

  if (!colleges || colleges.length === 0) {
    colleges = initialColleges as any;
  }

  if (filters?.sport) {
    colleges = colleges.filter((c) =>
      c.supported_sports.some((s) =>
        s.toLowerCase().includes(filters.sport!.toLowerCase())
      )
    );
  }

  return colleges;
}

export async function getCollegeById(id: string): Promise<College | null> {
  try {
    const { data, error } = await supabase
      .from('colleges')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    if (data) return data as College;
  } catch (err) {
    console.warn("getCollegeById DB call failed, using fallback:", err);
  }

  return (initialColleges.find((c) => c.id === id) as any) || null;
}

// Opportunity APIs
export async function getOpportunities(filters?: {
  type?: string;
  sport?: string;
  state?: string;
  womenFocused?: boolean;
}): Promise<Opportunity[]> {
  let opportunities: Opportunity[] = [];
  try {
    let query = supabase.from('opportunities').select('*');

    if (filters?.type) {
      query = query.eq('type', filters.type);
    }
    if (filters?.womenFocused) {
      query = query.eq('women_focused', true);
    }
    if (filters?.state) {
      query = query.eq('state', filters.state);
    }

    const { data, error } = await query.order('deadline', { ascending: true });
    if (error) throw error;
    opportunities = data as Opportunity[];
  } catch (err) {
    console.warn("getOpportunities DB call failed, using fallback:", err);
  }

  if (!opportunities || opportunities.length === 0) {
    opportunities = initialOpportunities as any;
  }

  if (filters?.sport) {
    opportunities = opportunities.filter(
      (o) =>
        !o.sport || o.sport.toLowerCase().includes(filters.sport!.toLowerCase())
    );
  }

  return opportunities;
}

export async function getOpportunityById(id: string): Promise<Opportunity | null> {
  try {
    const { data, error } = await supabase
      .from('opportunities')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    if (data) return data as Opportunity;
  } catch (err) {
    console.warn("getOpportunityById DB call failed, using fallback:", err);
  }

  return (initialOpportunities.find((o) => o.id === id) as any) || null;
}

// Training Resource APIs
export async function getTrainingResources(filters?: {
  category?: string;
  sport?: string;
  contentType?: string;
}): Promise<TrainingResource[]> {
  let resources: TrainingResource[] = [];
  try {
    let query = supabase
      .from('training_resources')
      .select('*')
      .eq('is_published', true);

    if (filters?.category) {
      query = query.eq('category', filters.category);
    }
    if (filters?.contentType) {
      query = query.eq('content_type', filters.contentType);
    }
    if (filters?.sport) {
      query = query.or(`sport.is.null,sport.eq.${filters.sport}`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    resources = data as TrainingResource[];
  } catch (err) {
    console.warn("getTrainingResources DB call failed, using fallback:", err);
  }

  if (!resources || resources.length === 0) {
    resources = initialTrainingResources as any;
  }

  return resources;
}

export async function getTrainingResourceById(id: string): Promise<TrainingResource | null> {
  try {
    const { data, error } = await supabase
      .from('training_resources')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    if (data) return data as TrainingResource;
  } catch (err) {
    console.warn("getTrainingResourceById DB call failed, using fallback:", err);
  }

  return (initialTrainingResources.find((r) => r.id === id) as any) || null;
}

export async function incrementResourceViewCount(id: string): Promise<void> {
  const { error } = await supabase.rpc('increment_view_count', { resource_id: id });
  if (error) {
    const resource = await getTrainingResourceById(id);
    if (resource) {
      await supabase
        .from('training_resources')
        .update({ view_count: resource.view_count + 1 })
        .eq('id', id);
    }
  }
}

// Mentor Review APIs
export async function createMentorReview(review: {
  mentorId: string;
  athleteId: string;
  mentorshipRequestId?: string;
  ratings: {
    respectful: number;
    helpful: number;
    knowledgeable: number;
    safeCommunication: number;
    punctual: number;
  };
  comment?: string;
  privateSafetyFlag?: boolean;
}): Promise<MentorReview> {
  const { data, error } = await supabase
    .from('mentor_reviews')
    .insert({
      mentor_id: review.mentorId,
      athlete_id: review.athleteId,
      mentorship_request_id: review.mentorshipRequestId || null,
      respectful: review.ratings.respectful,
      helpful: review.ratings.helpful,
      knowledgeable: review.ratings.knowledgeable,
      safe_communication: review.ratings.safeCommunication,
      punctual: review.ratings.punctual,
      comment: review.comment || null,
      private_safety_flag: review.privateSafetyFlag || false,
    })
    .select()
    .single();

  if (error) throw error;
  return data as MentorReview;
}

export async function getMentorReviews(mentorId: string): Promise<MentorReview[]> {
  const { data, error } = await supabase
    .from('mentor_reviews')
    .select('*')
    .eq('mentor_id', mentorId)
    .eq('visible', true)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as MentorReview[];
}

// Chat APIs
export async function getChatThreads(userId: string): Promise<ChatThread[]> {
  let dbThreads: ChatThread[] = [];
  try {
    const { data, error } = await supabase
      .from('chat_threads')
      .select(
        ` *,
        athlete:profiles!athlete_id(id, full_name, avatar_url),
        mentor:profiles!mentor_id(id, full_name, avatar_url)
      `
      )
      .or(`athlete_id.eq.${userId},mentor_id.eq.${userId}`)
      .eq('is_active', true)
      .order('last_message_at', { ascending: false });

    if (error) throw error;
    dbThreads = data as ChatThread[];
  } catch (err) {
    console.warn("getChatThreads DB query failed, using fallback:", err);
  }

  const localThreads = getLocal<ChatThread>(LOCAL_STORAGE_KEYS.THREADS);
  const filteredLocal = localThreads.filter(t => t.athlete_id === userId || t.mentor_id === userId);
  
  const populatedLocal = filteredLocal.map(t => ({
    ...t,
    athlete: t.athlete || fallbackProfiles[t.athlete_id] || { id: t.athlete_id, full_name: 'Anjali Devi', role: 'ATHLETE' },
    mentor: t.mentor || fallbackProfiles[t.mentor_id] || { id: t.mentor_id, full_name: 'Coach Sunil Kumar', role: 'MENTOR' }
  }));

  const combined = [...dbThreads];
  for (const lt of populatedLocal) {
    if (!combined.some(dt => dt.id === lt.id)) {
      combined.push(lt as any);
    }
  }

  return combined.sort((a, b) => {
    const timeA = a.last_message_at ? new Date(a.last_message_at).getTime() : 0;
    const timeB = b.last_message_at ? new Date(b.last_message_at).getTime() : 0;
    return timeB - timeA;
  });
}

export async function getOrCreateChatThread(
  athleteId: string,
  mentorId: string,
  mentorshipRequestId?: string
): Promise<ChatThread> {
  try {
    const { data: existing, error: findError } = await supabase
      .from('chat_threads')
      .select('*')
      .eq('athlete_id', athleteId)
      .eq('mentor_id', mentorId)
      .maybeSingle();

    if (findError) throw findError;

    if (existing) {
      return existing as ChatThread;
    }

    const { data, error } = await supabase
      .from('chat_threads')
      .insert({
        athlete_id: athleteId,
        mentor_id: mentorId,
        mentorship_request_id: mentorshipRequestId || null,
      })
      .select()
      .single();

    if (error) throw error;
    return data as ChatThread;
  } catch (err) {
    console.warn("getOrCreateChatThread DB query/insert failed, using localStorage fallback:", err);
    const localThreads = getLocal<ChatThread>(LOCAL_STORAGE_KEYS.THREADS);
    const existing = localThreads.find(t => t.athlete_id === athleteId && t.mentor_id === mentorId);
    if (existing) {
      return existing;
    }

    const newThread: ChatThread = {
      id: crypto.randomUUID?.() || Math.random().toString(36).substring(2),
      athlete_id: athleteId,
      mentor_id: mentorId,
      mentorship_request_id: mentorshipRequestId || undefined,
      is_active: true,
      is_blocked: false,
      guardian_visible: true,
      last_message_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    localThreads.push(newThread);
    setLocal(LOCAL_STORAGE_KEYS.THREADS, localThreads);
    return newThread;
  }
}

export async function getChatMessages(threadId: string): Promise<ChatMessage[]> {
  let dbMsgs: ChatMessage[] = [];
  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .select(
        ` *,
        sender:profiles!sender_id(id, full_name, avatar_url)
      `
      )
      .eq('thread_id', threadId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    dbMsgs = data as ChatMessage[];
  } catch (err) {
    console.warn("getChatMessages DB query failed, using localStorage fallback:", err);
  }

  const localMsgs = getLocal<ChatMessage>(LOCAL_STORAGE_KEYS.MESSAGES);
  const filteredLocal = localMsgs.filter(m => m.thread_id === threadId);
  const populatedLocal = filteredLocal.map(m => ({
    ...m,
    sender: m.sender || fallbackProfiles[m.sender_id] || { id: m.sender_id, full_name: 'User', role: 'ATHLETE' }
  }));

  const combined = [...dbMsgs];
  for (const lm of populatedLocal) {
    if (!combined.some(dm => dm.id === lm.id)) {
      combined.push(lm as any);
    }
  }

  return combined.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
}

export async function sendChatMessage(
  threadId: string,
  senderId: string,
  content: string
): Promise<ChatMessage> {
  const newMsg: ChatMessage = {
    id: crypto.randomUUID?.() || Math.random().toString(36).substring(2),
    thread_id: threadId,
    sender_id: senderId,
    content,
    read: false,
    read_at: undefined,
    attachment_urls: [],
    moderation_flag: false,
    guardian_visible: true,
    is_system_message: false,
    created_at: new Date().toISOString()
  };

  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        thread_id: threadId,
        sender_id: senderId,
        content,
      })
      .select()
      .single();

    if (error) throw error;

    await supabase
      .from('chat_threads')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', threadId);

    return data as ChatMessage;
  } catch (err) {
    console.warn("sendChatMessage DB insert failed, saving to localStorage fallback:", err);
    const localMsgs = getLocal<ChatMessage>(LOCAL_STORAGE_KEYS.MESSAGES);
    localMsgs.push(newMsg);
    setLocal(LOCAL_STORAGE_KEYS.MESSAGES, localMsgs);

    const localThreads = getLocal<ChatThread>(LOCAL_STORAGE_KEYS.THREADS);
    const threadIndex = localThreads.findIndex(t => t.id === threadId);
    if (threadIndex !== -1) {
      localThreads[threadIndex].last_message_at = new Date().toISOString();
      setLocal(LOCAL_STORAGE_KEYS.THREADS, localThreads);
    }

    return newMsg;
  }
}

export async function markMessagesAsRead(threadId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('chat_messages')
    .update({ read: true, read_at: new Date().toISOString() })
    .eq('thread_id', threadId)
    .neq('sender_id', userId)
    .eq('read', false);

  if (error) throw error;
}

// Notification APIs
export async function getNotifications(userId: string): Promise<Notification[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Notification[];
}

export async function markNotificationAsRead(notificationId: string): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true, read_at: new Date().toISOString() })
    .eq('id', notificationId);

  if (error) throw error;
}

export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true, read_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('read', false);

  if (error) throw error;
}

export async function getUnreadNotificationCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('read', false);

  if (error) throw error;
  return count || 0;
}

// Success Story APIs
export async function getSuccessStories(featured?: boolean): Promise<SuccessStory[]> {
  let query = supabase
    .from('success_stories')
    .select(
      ` *,
      athlete:profiles!athlete_id(id, full_name, avatar_url)
    `
    )
    .eq('approved', true);

  if (featured) {
    query = query.eq('featured', true);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) throw error;
  return data as SuccessStory[];
}

export async function createSuccessStory(story: {
  athleteId: string;
  title: string;
  story: string;
  achievement?: string;
  imageUrl?: string;
}): Promise<SuccessStory> {
  const { data, error } = await supabase
    .from('success_stories')
    .insert({
      athlete_id: story.athleteId,
      title: story.title,
      story: story.story,
      achievement: story.achievement || null,
      image_url: story.imageUrl || null,
    })
    .select()
    .single();

  if (error) throw error;
  return data as SuccessStory;
}

// Admin APIs
export async function getAllProfiles(filters?: {
  role?: string;
  verified?: boolean;
}): Promise<Profile[]> {
  let query = supabase.from('profiles').select('*');

  if (filters?.role) {
    query = query.eq('role', filters.role);
  }
  if (filters?.verified !== undefined) {
    query = query.eq('verified', filters.verified);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) throw error;
  return data as Profile[];
}

export async function verifyMentor(mentorId: string): Promise<void> {
  const { error } = await supabase
    .from('mentor_profiles')
    .update({ verified: true })
    .eq('user_id', mentorId);

  if (error) throw error;

  await supabase.from('profiles').update({ verified: true }).eq('id', mentorId);
}

export async function suspendUser(userId: string): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ is_active: false })
    .eq('id', userId);

  if (error) throw error;
}

export async function getAdminStats(): Promise<{
  totalAthletes: number;
  totalMentors: number;
  verifiedMentors: number;
  pendingReports: number;
  activeScholarships: number;
}> {
  const [athletes, mentors, verifiedMentors, pendingReports, scholarships] = await Promise.all(
    [
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'ATHLETE'),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'MENTOR'),
      supabase
        .from('mentor_profiles')
        .select('*', { count: 'exact', head: true })
        .eq('verified', true),
      supabase
        .from('safety_reports')
        .select('*', { count: 'exact', head: true })
        .in('status', ['SUBMITTED', 'UNDER_REVIEW']),
      supabase.from('scholarships').select('*', { count: 'exact', head: true }),
    ]
  );

  return {
    totalAthletes: athletes.count || 0,
    totalMentors: mentors.count || 0,
    verifiedMentors: verifiedMentors.count || 0,
    pendingReports: pendingReports.count || 0,
    activeScholarships: scholarships.count || 0,
  };
}

// Live Search APIs
export async function searchLiveScholarships(filters?: {
  sport?: string;
  state?: string;
  girls_only?: boolean;
  source?: string;
}): Promise<LiveScholarship[]> {
  const params = new URLSearchParams();
  if (filters?.sport) params.append('sport', filters.sport);
  if (filters?.state) params.append('state', filters.state);
  if (filters?.girls_only) params.append('girls_only', 'true');
  if (filters?.source) params.append('source', filters.source);

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const functionUrl = `${supabaseUrl}/functions/v1/live-scholarship-search?${params.toString()}`;

  const response = await fetch(functionUrl, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const result = await response.json();
  if (!result.success) throw new Error(result.error);
  return result.data as LiveScholarship[];
}

export async function searchLiveColleges(filters?: {
  state?: string;
  sports_quota?: boolean;
  source?: string;
}): Promise<LiveCollege[]> {
  const params = new URLSearchParams();
  if (filters?.state) params.append('state', filters.state);
  if (filters?.sports_quota) params.append('sports_quota', 'true');
  if (filters?.source) params.append('source', filters.source);

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const functionUrl = `${supabaseUrl}/functions/v1/live-college-search?${params.toString()}`;

  const response = await fetch(functionUrl, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const result = await response.json();
  if (!result.success) throw new Error(result.error);
  return result.data as LiveCollege[];
}

export async function getAIMatches(params: {
  athleteProfile: {
    sport?: string;
    level?: string;
    state?: string;
    age?: number;
    achievements?: Array<{ title: string; level: string }>;
    goals?: string;
  };
  matchType: 'scholarship' | 'college';
  items: Array<{
    id: string;
    name: string;
    eligibility?: string;
    sport?: string;
    state?: string;
    min_age?: number;
    max_age?: number;
    required_achievement_level?: string;
    girls_only?: boolean;
    supported_sports?: string[];
  }>;
}): Promise<{
  all_matches: AIMatchResult[];
  top_matches: AIMatchResult[];
  potential_matches: AIMatchResult[];
  summary: {
    total_analyzed: number;
    excellent_matches: number;
    good_matches: number;
    moderate_matches: number;
  };
}> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const functionUrl = `${supabaseUrl}/functions/v1/ai-match-scholarships`;

  const response = await fetch(functionUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      user_id: 'current_user',
      athlete_profile: params.athleteProfile,
      match_type: params.matchType,
      items: params.items,
    }),
  });

  const result = await response.json();
  if (!result.success) throw new Error(result.error);
  return result.data;
}

// Save live scholarship to user's saved list
export async function saveLiveScholarship(
  userId: string,
  scholarship: LiveScholarship,
  matchScore?: number
): Promise<void> {
  // First, ensure the scholarship is in the cache table
  const { data: existing } = await supabase
    .from('live_scholarship_cache')
    .select('id')
    .eq('external_id', scholarship.external_id)
    .maybeSingle();

  let cacheId: string;

  if (existing) {
    cacheId = existing.id;
  } else {
    const { data: inserted, error } = await supabase
      .from('live_scholarship_cache')
      .insert({
        external_id: scholarship.external_id,
        source: scholarship.source,
        name: scholarship.name,
        provider: scholarship.provider,
        amount: scholarship.amount,
        eligibility: scholarship.eligibility,
        deadline: scholarship.deadline,
        state: scholarship.state,
        sport: scholarship.sport,
        girls_only: scholarship.girls_only,
        hostel_support: scholarship.hostel_support,
        application_mode: scholarship.application_mode,
        description: scholarship.description,
        application_url: scholarship.application_url,
        min_age: scholarship.min_age,
        max_age: scholarship.max_age,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      })
      .select('id')
      .single();

    if (error) throw error;
    cacheId = inserted.id;
  }

  // Save to user's saved list
  const { error: saveError } = await supabase
    .from('saved_live_scholarships')
    .insert({
      user_id: userId,
      scholarship_cache_id: cacheId,
      match_score: matchScore || 0,
    });

  if (saveError && !saveError.message.includes('duplicate')) {
    throw saveError;
  }
}

// Save live college to user's saved list
export async function saveLiveCollege(
  userId: string,
  college: LiveCollege,
  matchScore?: number
): Promise<void> {
  // First, ensure the college is in the cache table
  const { data: existing } = await supabase
    .from('live_college_cache')
    .select('id')
    .eq('external_id', college.external_id)
    .maybeSingle();

  let cacheId: string;

  if (existing) {
    cacheId = existing.id;
  } else {
    const { data: inserted, error } = await supabase
      .from('live_college_cache')
      .insert({
        external_id: college.external_id,
        source: college.source,
        name: college.name,
        location: college.location,
        state: college.state,
        sports_quota: college.sports_quota,
        fee_concession: college.fee_concession,
        hostel: college.hostel,
        supported_sports: college.supported_sports,
        quota_rules: college.quota_rules,
        required_achievement_level: college.required_achievement_level,
        academic_streams: college.academic_streams,
        website_url: college.website_url,
        contact_email: college.contact_email,
        contact_phone: college.contact_phone,
        nirf_ranking: college.nirf_ranking,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .select('id')
      .single();

    if (error) throw error;
    cacheId = inserted.id;
  }

  // Save to user's saved list
  const { error: saveError } = await supabase
    .from('saved_live_colleges')
    .insert({
      user_id: userId,
      college_cache_id: cacheId,
      match_score: matchScore || 0,
    });

  if (saveError && !saveError.message.includes('duplicate')) {
    throw saveError;
  }
}

// Get saved live scholarships
export async function getSavedLiveScholarships(userId: string): Promise<Array<{
  id: string;
  match_score: number;
  notes?: string;
  status: string;
  created_at: string;
  scholarship: LiveScholarship;
}>> {
  const { data, error } = await supabase
    .from('saved_live_scholarships')
    .select(
      `
      id,
      match_score,
      notes,
      status,
      created_at,
      scholarship:scholarship_cache_id (
        id,
        external_id,
        source,
        name,
        provider,
        amount,
        eligibility,
        deadline,
        state,
        sport,
        girls_only,
        hostel_support,
        application_mode,
        description,
        application_url,
        min_age,
        max_age
      )
    `
    )
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return data.map((item: Record<string, unknown>) => ({
    id: item.id as string,
    match_score: item.match_score as number,
    notes: item.notes as string | undefined,
    status: item.status as string,
    created_at: item.created_at as string,
    scholarship: item.scholarship as LiveScholarship,
  }));
}

// Get saved live colleges
export async function getSavedLiveColleges(userId: string): Promise<Array<{
  id: string;
  match_score: number;
  notes?: string;
  created_at: string;
  college: LiveCollege;
}>> {
  const { data, error } = await supabase
    .from('saved_live_colleges')
    .select(
      `
      id,
      match_score,
      notes,
      created_at,
      college:college_cache_id (
        id,
        external_id,
        source,
        name,
        location,
        state,
        sports_quota,
        fee_concession,
        hostel,
        supported_sports,
        quota_rules,
        required_achievement_level,
        academic_streams,
        website_url,
        contact_email,
        contact_phone,
        nirf_ranking
      )
    `
    )
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return data.map((item: Record<string, unknown>) => ({
    id: item.id as string,
    match_score: item.match_score as number,
    notes: item.notes as string | undefined,
    created_at: item.created_at as string,
    college: item.college as LiveCollege,
  }));
}

// Remove saved live scholarship
export async function unsaveLiveScholarship(userId: string, scholarshipId: string): Promise<void> {
  const { error } = await supabase
    .from('saved_live_scholarships')
    .delete()
    .eq('id', scholarshipId)
    .eq('user_id', userId);

  if (error) throw error;
}

// Remove saved live college
export async function unsaveLiveCollege(userId: string, collegeId: string): Promise<void> {
  const { error } = await supabase
    .from('saved_live_colleges')
    .delete()
    .eq('id', collegeId)
    .eq('user_id', userId);

  if (error) throw error;
}

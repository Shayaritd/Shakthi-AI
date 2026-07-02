export interface Scholarship {
  id: string;
  name: string;
  provider: string;
  amount: number | null;
  eligibility: string | null;
  deadline: string | null;
  state: string | null;
  sport: string | null;
  girls_only: boolean;
  hostel_support: boolean;
  application_mode: string | null;
  description: string | null;
  application_url: string | null;
  required_level: string | null;
  min_age: number | null;
  max_age: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface College {
  id: string;
  name: string;
  location: string | null;
  state: string | null;
  sports_quota: boolean;
  fee_concession: number;
  hostel: boolean;
  supported_sports: string[];
  quota_rules: string | null;
  required_achievement_level: string | null;
  academic_streams: string[];
  last_date: string | null;
  website_url: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Opportunity {
  id: string;
  title: string;
  type: string;
  organization: string | null;
  location: string | null;
  state: string | null;
  deadline: string | null;
  event_date: string | null;
  description: string | null;
  sport: string | null;
  women_focused: boolean;
  age_min: number | null;
  age_max: number | null;
  registration_url: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TrainingResource {
  id: string;
  title: string;
  category: string | null;
  content_type: string;
  content: string | null;
  video_url: string | null;
  author: string | null;
  created_by: string | null;
  duration_minutes: number | null;
  view_count: number;
  is_published: boolean;
  sport: string | null;
  thumbnail_url: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export const initialScholarships: Scholarship[] = [
  {
    id: "s1",
    name: "Khelo India Girls Sports Scholarship",
    provider: "Ministry of Youth Affairs & Sports",
    amount: 500000,
    eligibility: "Indian female athletes aged 10-18 with state/national level achievement",
    deadline: "2026-03-31",
    state: null,
    sport: null,
    girls_only: true,
    hostel_support: true,
    application_mode: "Online",
    description: "Comprehensive scholarship covering training, equipment, nutrition, and education support for talented girl athletes. Includes mentorship from national coaches.",
    application_url: "https://kheloindia.gov.in/girls-scholarship",
    required_level: "STATE",
    min_age: 10,
    max_age: 18,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "s2",
    name: "State Sports Talent Search Scholarship",
    provider: "Haryana Sports Department",
    amount: 200000,
    eligibility: "Haryana resident female athletes with district level achievement",
    deadline: "2026-04-15",
    state: "Haryana",
    sport: null,
    girls_only: true,
    hostel_support: true,
    application_mode: "Offline",
    description: "Financial support for training and competition expenses. Preference to athletics, wrestling, boxing, and kabaddi.",
    application_url: "https://haryanasports.gov.in/talent-search",
    required_level: "DISTRICT",
    min_age: 12,
    max_age: 25,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "s3",
    name: "Rural Sports Foundation Scholarship",
    provider: "Rural Sports Foundation",
    amount: 150000,
    eligibility: "Rural background female athletes with potential",
    deadline: "2026-02-28",
    state: null,
    sport: null,
    girls_only: true,
    hostel_support: false,
    application_mode: "Online",
    description: "Supporting rural girl athletes with talent but limited resources. Includes training at partner academies.",
    application_url: "https://ruralsportsfoundation.org/apply",
    required_level: "SCHOOL",
    min_age: 8,
    max_age: 18,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "s4",
    name: "Women in Sports Excellence Award",
    provider: "Sports Authority of India",
    amount: 300000,
    eligibility: "Female athletes representing India internationally",
    deadline: "2026-05-30",
    state: null,
    sport: null,
    girls_only: true,
    hostel_support: true,
    application_mode: "Online",
    description: "Prestigious scholarship for international level women athletes. Covers international training exposure.",
    application_url: "https://sportsauthorityofindia.gov.in/women-excellence",
    required_level: "INTERNATIONAL",
    min_age: 16,
    max_age: 28,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "s5",
    name: "BCCI Women's Cricket Scholarship",
    provider: "Board of Control for Cricket in India",
    amount: 400000,
    eligibility: "Female cricketers under 23",
    deadline: "2026-06-30",
    state: null,
    sport: "Cricket",
    girls_only: true,
    hostel_support: true,
    application_mode: "Online",
    description: "Dedicated cricket scholarship for women including coaching at NCA, equipment, and match exposure.",
    application_url: "https://bcci.tv/womens-scholarship",
    required_level: "STATE",
    min_age: 14,
    max_age: 23,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "s6",
    name: "Badminton Association Women's Grant",
    provider: "Badminton Association of India",
    amount: 250000,
    eligibility: "Female badminton players at state level",
    deadline: "2026-04-30",
    state: null,
    sport: "Badminton",
    girls_only: true,
    hostel_support: false,
    application_mode: "Online",
    description: "Training support for aspiring female badminton players. Includes access to top academies.",
    application_url: "https://badminmintonindia.org/womens-grant",
    required_level: "STATE",
    min_age: 12,
    max_age: 22,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "s7",
    name: "Maharashtra Krida Puraskar",
    provider: "Maharashtra Sports Ministry",
    amount: 175000,
    eligibility: "Maharashtra female athletes with state achievement",
    deadline: "2026-03-15",
    state: "Maharashtra",
    sport: null,
    girls_only: true,
    hostel_support: true,
    application_mode: "Offline",
    description: "State government scholarship for women athletes. Covers education and training expenses.",
    application_url: "https://maharashtrasports.gov.in/krida-puraskar",
    required_level: "STATE",
    min_age: 10,
    max_age: 21,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "s8",
    name: "Odisha Sports Excellence Scholarship",
    provider: "Sports Department Odisha",
    amount: 180000,
    eligibility: "Odisha residents with sports achievements",
    deadline: "2026-05-15",
    state: "Odisha",
    sport: null,
    girls_only: true,
    hostel_support: true,
    application_mode: "Online",
    description: "Scholarship for athletes in hockey, athletics, and indigenous sports. Includes hostel facility.",
    application_url: "https://odishasports.gov.in/excellence-scholarship",
    required_level: "DISTRICT",
    min_age: 11,
    max_age: 22,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const initialColleges: College[] = [
  {
    id: "c1",
    name: "Delhi University Sports College",
    location: "New Delhi",
    state: "Delhi",
    sports_quota: true,
    fee_concession: 50,
    hostel: true,
    supported_sports: ["Athletics", "Cricket", "Badminton", "Table Tennis", "Football", "Basketball"],
    quota_rules: "5% seats reserved for national level, 3% for state level athletes",
    required_achievement_level: "STATE",
    academic_streams: ["Arts", "Science", "Commerce"],
    last_date: "2026-06-15",
    website_url: "https://du.ac.in/sports-quota",
    contact_email: "sportsquota@du.ac.in",
    contact_phone: "+91-11-27001234",
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "c2",
    name: "Punjab University Sports Department",
    location: "Chandigarh",
    state: "Punjab",
    sports_quota: true,
    fee_concession: 40,
    hostel: true,
    supported_sports: ["Athletics", "Hockey", "Wrestling", "Kabaddi", "Gymnastics"],
    quota_rules: "Sports quota admission with trail-based selection",
    required_achievement_level: "DISTRICT",
    academic_streams: ["Arts", "Science"],
    last_date: "2026-05-31",
    website_url: "https://puchd.ac.in/sports",
    contact_email: "sportsdept@puchd.ac.in",
    contact_phone: "+91-172-2541234",
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "c3",
    name: "Savitribai Phule Pune University",
    location: "Pune",
    state: "Maharashtra",
    sports_quota: true,
    fee_concession: 35,
    hostel: true,
    supported_sports: ["Athletics", "Swimming", "Badminton", "Volleyball", "Kho-Kho"],
    quota_rules: "Merit-cum-sports achievement based admission",
    required_achievement_level: "STATE",
    academic_streams: ["Arts", "Science", "Commerce"],
    last_date: "2026-06-20",
    website_url: "https://unipune.ac.in/sports",
    contact_email: "sportsquota@unipune.ac.in",
    contact_phone: "+91-20-25601234",
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "c4",
    name: "Anna University Sports Academy",
    location: "Chennai",
    state: "Tamil Nadu",
    sports_quota: true,
    fee_concession: 45,
    hostel: true,
    supported_sports: ["Athletics", "Badminton", "Basketball", "Table Tennis", "Swimming"],
    quota_rules: "Engineering admission sports quota for state/national players",
    required_achievement_level: "STATE",
    academic_streams: ["Engineering", "Technology"],
    last_date: "2026-05-15",
    website_url: "https://annauniv.edu/sports",
    contact_email: "sportsacademy@annauniv.edu",
    contact_phone: "+91-44-22351234",
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "c5",
    name: "Banaras Hindu University",
    location: "Varanasi",
    state: "Uttar Pradesh",
    sports_quota: true,
    fee_concession: 30,
    hostel: true,
    supported_sports: ["Athletics", "Wrestling", "Boxing", "Kabaddi", "Archery"],
    quota_rules: "Sports quota admission through sports trial and certificate verification",
    required_achievement_level: "DISTRICT",
    academic_streams: ["Arts", "Science", "Commerce"],
    last_date: "2026-04-30",
    website_url: "https://bhu.ac.in/sports-quota",
    contact_email: "sports@bhu.ac.in",
    contact_phone: "+91-542-2361234",
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const initialOpportunities: Opportunity[] = [
  {
    id: "o1",
    title: "Khelo India Women's Kabaddi League",
    type: "TOURNAMENT",
    organization: "Amateur Kabaddi Federation of India",
    location: "Hisar",
    state: "Haryana",
    deadline: "2026-02-15",
    event_date: "2026-03-01",
    description: "National level tournament for women kabaddi players. Winners get direct selection for national camp.",
    sport: "Kabaddi",
    women_focused: true,
    age_min: 16,
    age_max: 28,
    registration_url: "https://akhindia.org/womens-league",
    contact_email: "kabaddiwoman@afi.org",
    contact_phone: "+91-11-24361234",
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "o2",
    title: "National Women's Athletics Championship",
    type: "TOURNAMENT",
    organization: "Athletics Federation of India",
    location: "Bengaluru",
    state: "Karnataka",
    deadline: "2026-02-28",
    event_date: "2026-03-15",
    description: "Annual championship with qualification for Asian Games trials. Events: 100m, 200m, 400m, 800m, long jump, discus throw.",
    sport: "Athletics",
    women_focused: true,
    age_min: 14,
    age_max: 30,
    registration_url: "https://afi.org.in/national-womens-championship",
    contact_email: "womensathletics@afi.org",
    contact_phone: "+91-80-23411234",
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "o3",
    title: "SAI Sports Excellence Camp",
    type: "CAMP",
    organization: "Sports Authority of India",
    location: "Multiple Locations",
    state: null,
    deadline: "2026-03-01",
    event_date: "2026-04-15",
    description: "45-day intensive training camp at SAI centers. For U-18 athletes in athletics, badminton, and wrestling.",
    sport: null,
    women_focused: true,
    age_min: 12,
    age_max: 18,
    registration_url: "https://sportsauthorityofindia.gov.in/excellence-camp",
    contact_email: "excellence@sai.gov.in",
    contact_phone: "+91-11-26811234",
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "o4",
    title: "Women's Cricket U-19 Selection Trials",
    type: "TRIAL",
    organization: "BCCI",
    location: "Delhi",
    state: "Delhi",
    deadline: "2026-01-30",
    event_date: "2026-02-10",
    description: "Selection trials for India U-19 women's cricket team. Open to registered players with state achievement.",
    sport: "Cricket",
    women_focused: true,
    age_min: 15,
    age_max: 19,
    registration_url: "https://bcci.tv/womens-u19-trials",
    contact_email: "womencricket@bcci.tv",
    contact_phone: "+91-22-22851234",
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "o5",
    title: "BWF Badminton Academy Program",
    type: "ACADEMY",
    organization: "Badminton Association of India",
    location: "Hyderabad",
    state: "Telangana",
    deadline: "2026-02-20",
    event_date: "2026-06-01",
    description: "4-month residential program at Pullela Gopichand Academy. Selection based on state level achievement.",
    sport: "Badminton",
    women_focused: true,
    age_min: 11,
    age_max: 17,
    registration_url: "https://badminmintonindia.org/academy-program",
    contact_email: "academy@bai.org.in",
    contact_phone: "+91-40-23451234",
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const initialTrainingResources: TrainingResource[] = [
  {
    id: "r1",
    title: "Beginner's Guide to Athletics Training",
    category: "Training Basics",
    content_type: "GUIDE",
    content: "Complete guide covering warm-up, technique drills, and cool-down for young athletes. Includes nutrition advice and recovery tips.",
    video_url: null,
    author: "Coach Ramesh Kumar",
    created_by: null,
    duration_minutes: 45,
    view_count: 0,
    is_published: true,
    sport: "Athletics",
    thumbnail_url: null,
    tags: ["beginner", "warm-up", "technique", "nutrition"],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "r2",
    title: "Mental Strength for Athletes",
    category: "Mental Health",
    content_type: "ARTICLE",
    content: "Understanding the importance of mental health in sports performance. Tips on handling pressure, staying motivated, and dealing with setbacks.",
    video_url: null,
    author: "Dr. Priya Sharma",
    created_by: null,
    duration_minutes: 20,
    view_count: 0,
    is_published: true,
    sport: null,
    thumbnail_url: null,
    tags: ["mental health", "motivation", "pressure"],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "r3",
    title: "Nutrition Guide for Female Athletes",
    category: "Nutrition",
    content_type: "ARTICLE",
    content: "Essential nutrition advice for girl athletes including iron requirements, protein intake, and maintaining energy balance during training.",
    video_url: null,
    author: "Dr. Anjali Rao",
    created_by: null,
    duration_minutes: 25,
    view_count: 0,
    is_published: true,
    sport: null,
    thumbnail_url: null,
    tags: ["nutrition", "iron", "protein", "energy"],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "r4",
    title: "Kabaddi Training Drills - Video Series",
    category: "Training Basics",
    content_type: "VIDEO",
    content: "Step-by-step video tutorials for kabaddi skills including raiding technique, defending positions, and conditioning exercises.",
    video_url: "https://training.shakthi.org/kabaddi-drills",
    author: "Coach Sunil Kumar",
    created_by: null,
    duration_minutes: 60,
    view_count: 0,
    is_published: true,
    sport: "Kabaddi",
    thumbnail_url: null,
    tags: ["kabaddi", "raiding", "defending", "drills"],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "r5",
    title: "Injury Prevention Exercises",
    category: "Exercise",
    content_type: "EXERCISE",
    content: "Daily routine of 15 exercises to prevent common sports injuries. Focus on knees, ankles, and shoulders.",
    video_url: null,
    author: "Physio Arun Patel",
    created_by: null,
    duration_minutes: 30,
    view_count: 0,
    is_published: true,
    sport: null,
    thumbnail_url: null,
    tags: ["injury prevention", "mobility", "strength"],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

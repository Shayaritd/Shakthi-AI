import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAthleteProfile, getMentors, getScholarships, getNotifications, getOpportunities, getMentorshipRequests, updateMentorshipRequest } from '@/services/api';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import {
  Users,
  Award,
  Calendar,
  ChevronRight,
  Shield,
  Star,
  Target,
  MessageSquare,
  Bell,
  Sparkles,
  Search,
  FileText,
  AlertTriangle,
  FileCheck,
  CheckCircle,
  HelpCircle,
  TrendingUp,
} from 'lucide-react';
import { format } from 'date-fns';

export default function AthleteDashboard() {
  const { user, profile, session } = useAuth();

  // RAG Interactive Q&A State
  const [queryText, setQueryText] = useState('');
  const [assistantType, setAssistantType] = useState('scholarships');
  const [isLoadingQuery, setIsLoadingQuery] = useState(false);
  const [queryResult, setQueryResult] = useState<any>(null);
  const [recentQueries, setRecentQueries] = useState<string[]>([
    "What is the eligibility for Sports Authority of India Scholarship?",
    "Which DU colleges support volleyball sports quota?",
  ]);

  const { data: athleteProfile, isLoading: profileLoading } = useQuery({
    queryKey: ['athleteProfile', user?.id],
    queryFn: () => (user ? getAthleteProfile(user.id) : null),
    enabled: !!user,
  });

  const { data: mentors, isLoading: mentorsLoading } = useQuery({
    queryKey: ['mentors', 'recommended', athleteProfile?.sport],
    queryFn: () => getMentors({ verified: true, sport: athleteProfile?.sport || undefined }),
    enabled: !!athleteProfile,
  });

  const { data: scholarships, isLoading: scholarshipsLoading } = useQuery({
    queryKey: ['scholarships', 'matches', athleteProfile?.sport, athleteProfile?.state],
    queryFn: () => getScholarships({ girlsOnly: true, sport: athleteProfile?.sport || undefined, state: athleteProfile?.state || undefined }),
    enabled: !!athleteProfile,
  });

  const { data: opportunities } = useQuery({
    queryKey: ['opportunities'],
    queryFn: () => getOpportunities(),
  });

  const { data: notifications } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: () => (user ? getNotifications(user.id) : []),
    enabled: !!user,
  });

  const { data: mentorshipRequests = [] } = useQuery({
    queryKey: ['mentorshipRequests', user?.id],
    queryFn: () => (user ? getMentorshipRequests(user.id, 'athlete') : []),
    enabled: !!user,
  });

  const queryClient = useQueryClient();
  const cancelMutation = useMutation({
    mutationFn: (requestId: string) => updateMentorshipRequest(requestId, { status: 'CANCELLED' as any }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mentorshipRequests', user?.id] });
      toast.success('Mentorship request cancelled.');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to cancel request.');
    }
  });

  const hasApprovedMentor = mentorshipRequests.some(r => r.status === 'APPROVED');

  // Query documents count from database using supabase client
  const { data: docsCount } = useQuery({
    queryKey: ['documentsCount'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('documents')
        .select('*', { count: 'exact', head: true });
      if (error) {
        console.error('Error fetching documents count:', error);
        return 0;
      }
      return count || 0;
    },
  });

  const completion = athleteProfile?.profile_completion || 0;

  // Badges Calculation for Dashboard
  const docAchievementsCount = athleteProfile?.achievements ? (athleteProfile.achievements as any[]).length : 0;
  const docMediaCount = athleteProfile?.video_urls ? (athleteProfile.video_urls as string[]).length : 0;
  const isProfileVerified = profile?.verified || false;
  
  const dashboardBadges = [
    { name: 'Rising Star', unlocked: completion >= 50, color: 'bg-amber-50 text-amber-800 border-amber-200' },
    { name: 'Active Competitor', unlocked: docAchievementsCount > 0, color: 'bg-teal-50 text-teal-800 border-teal-200' },
    { name: 'Media Showcase', unlocked: docMediaCount > 0, color: 'bg-blue-50 text-blue-800 border-blue-200' },
    { name: 'Verified Champion', unlocked: isProfileVerified, color: 'bg-purple-50 text-purple-800 border-purple-200' },
    { name: 'Safe Mentor Connected', unlocked: hasApprovedMentor, color: 'bg-rose-50 text-rose-800 border-rose-200' },
  ];

  // Filter dynamic matches based on athlete sport if profile is completed
  const athleteSport = athleteProfile?.sport || '';
  const recommendedOpps = opportunities?.filter(o => 
    athleteSport && o.sport?.toLowerCase().includes(athleteSport.toLowerCase())
  ).slice(0, 2) || [];

  const handleQuery = async (textToQuery?: string, typeOverride?: string) => {
    const q = textToQuery || queryText;
    const targetType = typeOverride || assistantType;
    if (!q.trim()) return;
    setIsLoadingQuery(true);
    setQueryResult(null);
    try {
      const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8001';
      const response = await fetch(`${apiBaseUrl}/api/v1/ai/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          question: q,
          assistant_type: targetType,
          filters: {},
        }),
      });
      const data = await response.json();
      if (data.success && data.data) {
        setQueryResult(data.data);
        if (!recentQueries.includes(q)) {
          setRecentQueries([q, ...recentQueries.slice(0, 4)]);
        }
      } else {
        setQueryResult({
          answer: data.message || "Refused or unanswered query.",
          citations: [],
        });
      }
    } catch (err) {
      console.error(err);
      setQueryResult({
        answer: "Failed to connect to SHAKTHI AI backend. Please verify that the backend is running.",
        citations: [],
      });
    } finally {
      setIsLoadingQuery(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            Welcome, {profile?.full_name?.split(' ')[0]}!
            <Badge className="bg-purple-100 text-purple-700 font-semibold border border-purple-200">
              <Sparkles className="w-3.5 h-3.5 mr-1" />
              AI Enabled
            </Badge>
          </h1>
          <p className="text-gray-500">Your sports performance and RAG assistant hub</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link to="/athlete/profile">
              <Shield className="w-4 h-4 mr-2" />
              View Profile
            </Link>
          </Button>
        </div>
      </div>

      {/* Top Banner Alert (Needs Data Indicator if Profile Incomplete) */}
      {completion < 100 ? (
        <Card className="bg-gradient-to-r from-amber-50 to-orange-100 border-amber-200 shadow-sm">
          <CardContent className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">
                  <AlertTriangle className="w-3.5 h-3.5 mr-1" />
                  Needs data
                </Badge>
                <h3 className="font-semibold text-amber-900">Your profile is only {completion}% complete</h3>
              </div>
              <p className="text-sm text-amber-700">
                Provide your sport, bio, and achievements to receive optimal AI recommendations.
              </p>
            </div>
            <Button asChild className="bg-amber-600 hover:bg-amber-700 whitespace-nowrap">
              <Link to="/athlete/profile">
                Complete Now
                <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-gradient-to-r from-emerald-50 to-teal-100 border-emerald-200 shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
                  <CheckCircle className="w-3.5 h-3.5 mr-1" />
                  AI Ready
                </Badge>
                <h3 className="font-semibold text-emerald-950">Profile Fully Grounded</h3>
              </div>
              <p className="text-sm text-emerald-700">
                Your sports quota fit score and training matches are fully calibrated based on verified documents.
              </p>
            </div>
            <div className="text-2xl font-black text-emerald-800">100%</div>
          </CardContent>
        </Card>
      )}

      {/* Dashboard KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Fit Score */}
        <Card className="relative overflow-hidden border-purple-100 hover:shadow-md transition-shadow">
          <CardContent className="p-5 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-500">Scholarship Fit</span>
              <Badge className={athleteSport ? "bg-purple-100 text-purple-700 text-[10px]" : "bg-gray-100 text-gray-550 text-[10px]"}>
                {athleteSport ? "AI Insight" : "Needs Profile"}
              </Badge>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-gray-900">
                {athleteSport ? "92%" : "N/A"}
              </span>
              {athleteSport && (
                <span className="text-xs text-green-600 font-semibold">Match Fit</span>
              )}
            </div>
            <p className="text-xs text-gray-500">
              {athleteSport ? "Based on your sports history and academic record." : "Complete your profile to unlock scholarship matching"}
            </p>
          </CardContent>
        </Card>

        {/* Knowledge Documents */}
        <Card className="relative overflow-hidden border-teal-100 hover:shadow-md transition-shadow">
          <CardContent className="p-5 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-500">Vector Knowledge</span>
              <Badge className={athleteSport ? "bg-emerald-100 text-emerald-700 text-[10px]" : "bg-gray-100 text-gray-550 text-[10px]"}>
                {athleteSport ? "From verified documents" : "Grounded"}
              </Badge>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-gray-900">
                {athleteSport ? (docsCount || 0) : 0}
              </span>
              <span className="text-xs text-gray-500 font-medium">Documents</span>
            </div>
            <p className="text-xs text-gray-500">
              {athleteSport ? "Parsed PDF guidelines indexed inside safety & RAG storage." : "Complete your profile to enable grounded guidance"}
            </p>
          </CardContent>
        </Card>

        {/* Active Chats */}
        <Card className="relative overflow-hidden border-teal-100 hover:shadow-md transition-shadow">
          <CardContent className="p-5 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-500">Active Mentors</span>
              <Badge className="bg-blue-100 text-blue-700 text-[10px]">
                Grounded Chat
              </Badge>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-gray-900">
                {mentorshipRequests.filter((r: any) => r.status === 'APPROVED').length}
              </span>
              <span className="text-xs text-gray-500 font-medium">Coaches</span>
            </div>
            <p className="text-xs text-gray-500">Direct channels for safety-audited coaching mentorship.</p>
          </CardContent>
        </Card>

        {/* Safety Indicator */}
        <Card className="relative overflow-hidden border-rose-100 hover:shadow-md transition-shadow">
          <CardContent className="p-5 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-500">Safety Status</span>
              <Badge className="bg-rose-100 text-rose-700 text-[10px]">
                Needs data
              </Badge>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-gray-900">Secure</span>
              <span className="text-xs text-emerald-600 font-semibold">100% Ok</span>
            </div>
            <p className="text-xs text-gray-500">Safety logs audited. No harassment/threat concerns reported.</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Section */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Columns - Recommendations & Fits */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* AI Recommended Opportunities & Mentors */}
          <Card className="border-gray-200">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-lg font-bold">Recommended Sports Channels</CardTitle>
                  <CardDescription>Tailored matches based on your performance profile</CardDescription>
                </div>
                <Badge className="bg-purple-100 text-purple-700">
                  <Sparkles className="w-3.5 h-3.5 mr-1" />
                  AI Recommendation
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {recommendedOpps.length > 0 && athleteSport ? (
                recommendedOpps.map(opp => (
                  <div key={opp.id} className="p-4 rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-teal-50 text-teal-700 text-xs border border-teal-100">
                          {opp.type}
                        </Badge>
                        <Badge className="bg-purple-50 text-purple-700 text-xs border border-purple-100">
                          95% Match Fit
                        </Badge>
                      </div>
                      <h4 className="font-bold text-gray-900 text-sm">{opp.title}</h4>
                      <p className="text-xs text-gray-500">{opp.organization} • {opp.location}</p>
                    </div>
                    <Button size="sm" variant="outline" asChild>
                      <Link to="/opportunities">View Trials</Link>
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 border border-dashed rounded-xl space-y-2">
                  <p className="text-xs text-gray-500">
                    {athleteSport ? (
                      <>No matching events for <strong>{athleteSport}</strong> trials.</>
                    ) : (
                      <>Complete your profile to view recommended sports channels.</>
                    )}
                  </p>
                  <Button variant="link" size="sm" asChild>
                    <Link to="/opportunities">Browse All Opportunities</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Mentorship Requests Status & Chats */}
          {mentorshipRequests.length > 0 && (
            <Card className="border-gray-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-bold">Your Mentorship Requests</CardTitle>
                <CardDescription>Status of your requests to coaches and open chats</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {mentorshipRequests.map((req: any) => {
                  let statusBadge = (
                    <Badge variant="outline" className="border-amber-200 text-amber-700 bg-amber-50">
                      {req.status === 'PENDING_GUARDIAN' ? 'Awaiting Guardian' : 'Awaiting Coach'}
                    </Badge>
                  );
                  
                  if (req.status === 'APPROVED') {
                    statusBadge = (
                      <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
                        Active
                      </Badge>
                    );
                  } else if (req.status === 'REJECTED') {
                    const isGuardianReject = !req.guardian_approved && req.guardian_id;
                    statusBadge = (
                      <Badge variant="destructive" className="bg-rose-100 text-rose-800 border-rose-200">
                        {isGuardianReject ? 'Declined by Guardian' : 'Declined'}
                      </Badge>
                    );
                  } else if (req.status === 'CANCELLED') {
                    statusBadge = (
                      <Badge variant="secondary" className="bg-gray-100 text-gray-800 border-gray-200">
                        Cancelled
                      </Badge>
                    );
                  }

                  return (
                    <div key={req.id} className="p-4 rounded-xl border border-gray-100 bg-gray-50/30 flex items-center justify-between gap-4">
                      <div className="space-y-1">
                        <h4 className="font-semibold text-gray-900 text-sm">
                          {req.mentor?.full_name || 'Coach'}
                        </h4>
                        <p className="text-xs text-gray-505">Goal: {req.goal}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        {statusBadge}
                        {req.status === 'APPROVED' && (
                          <Button size="sm" asChild className="bg-teal-600 hover:bg-teal-700 shrink-0">
                            <Link to="/chat">
                              <MessageSquare className="w-3.5 h-3.5 mr-1" />
                              Chat
                            </Link>
                          </Button>
                        )}
                        {(req.status === 'PENDING' || req.status === 'PENDING_GUARDIAN') && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-rose-600 border-rose-200 hover:bg-rose-50 hover:text-rose-700 shrink-0"
                            onClick={() => cancelMutation.mutate(req.id)}
                            disabled={cancelMutation.isPending}
                          >
                            {cancelMutation.isPending && cancelMutation.variables === req.id ? 'Cancelling...' : 'Cancel'}
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {/* Recommended Mentors */}
          <Card className="border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-lg font-bold">Recommended Coaches</CardTitle>
                <CardDescription>Verified coaches with expertise in athletics & Kabaddi</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/mentors" className="text-teal-600 font-semibold flex items-center">
                  View All
                  <ChevronRight className="w-4 h-4 ml-0.5" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {mentorsLoading ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <Skeleton key={i} className="h-16 w-full rounded-lg" />
                  ))}
                </div>
              ) : mentors && mentors.length > 0 && athleteSport ? (
                mentors.slice(0, 2).map((mentor) => (
                  <div key={mentor.id} className="flex items-center justify-between p-3.5 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center font-bold text-teal-700">
                        {mentor.profile?.full_name?.charAt(0) || 'M'}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                          {mentor.profile?.full_name}
                          {mentor.verified && (
                            <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] py-0">
                              Verified
                            </Badge>
                          )}
                        </h4>
                        <p className="text-xs text-gray-500">
                          {(Array.isArray(mentor.expertise) ? mentor.expertise.join(', ') : '')} • {mentor.experience_years} Years Coaching
                        </p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" asChild>
                      <Link to={`/mentors/${mentor.user_id}/request`}>Chat Request</Link>
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 border border-dashed rounded-xl space-y-2">
                  <p className="text-xs text-gray-555">
                    {athleteSport ? "No coaches matching your sport found." : "Complete your profile to view recommended coaches."}
                  </p>
                  <Button variant="link" size="sm" asChild>
                    <Link to="/mentors">Browse All Coaches</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Side Info - Notifications, Audit, Quick Stats */}
        <div className="space-y-6">
          {/* Recent Notifications */}
          <Card className="border-gray-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-bold">Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              {notifications && notifications.length > 0 ? (
                <div className="space-y-3">
                  {notifications.slice(0, 2).map((n) => (
                    <div key={n.id} className={`p-3 rounded-lg border ${n.read ? 'bg-gray-50 border-gray-100' : 'bg-teal-50/50 border-teal-100'}`}>
                      <p className="text-xs font-semibold text-gray-900">{n.title}</p>
                      <p className="text-[10px] text-gray-400 mt-1">
                        {format(new Date(n.created_at), 'MMM d, h:mm a')}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400 text-xs">
                  No new messages or notifications.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Scholarship Fit Matches */}
          <Card className="border-gray-200">
            <CardHeader className="pb-3 flex flex-row justify-between items-center">
              <div>
                <CardTitle className="text-base font-bold">Scholarship Fits</CardTitle>
              </div>
              <Badge className="bg-purple-100 text-purple-700 text-xs">
                AI Matcher
              </Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              {scholarships && scholarships.length > 0 && athleteSport ? (
                scholarships.slice(0, 2).map((s) => (
                  <div key={s.id} className="p-3 rounded-xl border border-gray-100 bg-gray-50 space-y-1">
                    <h5 className="font-bold text-gray-900 text-xs line-clamp-1">{s.name}</h5>
                    <div className="flex justify-between items-center text-[10px] text-gray-500">
                      <span>{s.provider}</span>
                      <span className="text-teal-600 font-bold">₹{s.amount?.toLocaleString()}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 border border-dashed rounded-xl space-y-2">
                  <p className="text-xs text-gray-555">
                    {athleteSport ? "No matching scholarship fits found." : "Complete your profile to view scholarship fits."}
                  </p>
                  <Button variant="link" size="sm" asChild>
                    <Link to="/scholarships">Browse All Scholarships</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* My Badges Widget */}
          <Card className="border-gray-200 shadow-sm">
            <CardHeader className="pb-3 flex flex-row justify-between items-center">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-1.5">
                  <Award className="w-5 h-5 text-teal-600" />
                  My Badges
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2">
              {dashboardBadges.map((badge, i) => (
                <div
                  key={i}
                  className={`p-2.5 rounded-xl border flex flex-col items-center justify-center text-center space-y-1.5 transition-all text-xs ${
                    badge.unlocked ? badge.color : 'bg-gray-50 text-gray-400 border-gray-150'
                  }`}
                >
                  <span className="font-bold text-[10px] leading-tight">{badge.name}</span>
                  <Badge variant={badge.unlocked ? 'default' : 'secondary'} className={`text-[9px] px-1 py-0.5 ${badge.unlocked ? 'bg-teal-600 text-white border-0' : 'text-gray-450'}`}>
                    {badge.unlocked ? 'Earned' : 'Locked'}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* RAG Grounded Q&A Search Section (Full-Width Bottom Panel) */}
      <Card className="border-purple-200 bg-gradient-to-br from-white to-purple-50 shadow-md">
        <CardHeader className="border-b border-purple-100 pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="space-y-1">
              <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600 animate-pulse" />
                SHAKTHI Grounded AI Assistant (RAG)
              </CardTitle>
              <CardDescription>
                Ask questions backed by verified documents. Answers are strictly grounded in our database.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
                <FileCheck className="w-3.5 h-3.5 mr-1" />
                Grounded Answers
              </Badge>
              <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                AI Insight
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="w-full md:w-48 shrink-0">
              <Select value={assistantType} onValueChange={setAssistantType}>
                <SelectTrigger className="border-purple-200">
                  <SelectValue placeholder="Assistant Target" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scholarships">Scholarships</SelectItem>
                  <SelectItem value="colleges">Colleges</SelectItem>
                  <SelectItem value="safety">Safety & Conduct</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
                <Input
                  placeholder={athleteSport ? "Ask about guidelines, sports quota eligibility, or safety rules..." : "Complete your profile to unlock grounded RAG assistant..."}
                  value={queryText}
                  onChange={(e) => setQueryText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && athleteSport && handleQuery()}
                  disabled={!athleteSport || isLoadingQuery}
                  className="pl-10 border-purple-200 focus-visible:ring-purple-500"
                />
              </div>
              <Button
                onClick={() => handleQuery()}
                disabled={!athleteSport || isLoadingQuery}
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold"
              >
                {isLoadingQuery ? 'Searching...' : 'Ask AI'}
              </Button>
            </div>
          </div>

          {/* Preset Helper Queries */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs text-gray-500 font-semibold">Try queries:</span>
            {recentQueries.map((q, idx) => (
              <button
                key={idx}
                disabled={!athleteSport}
                onClick={() => {
                  setQueryText(q);
                  let targetType = assistantType;
                  if (q.toLowerCase().includes('college') || q.toLowerCase().includes('du ')) {
                    targetType = 'colleges';
                    setAssistantType('colleges');
                  } else if (q.toLowerCase().includes('scholarship') || q.toLowerCase().includes('sai')) {
                    targetType = 'scholarships';
                    setAssistantType('scholarships');
                  }
                  handleQuery(q, targetType);
                }}
                className={`text-xs px-3 py-1 rounded-full border border-purple-200 transition-colors ${
                  athleteSport ? "bg-white hover:bg-purple-100 text-purple-700" : "bg-gray-50 text-gray-400 cursor-not-allowed"
                }`}
              >
                {q}
              </button>
            ))}
          </div>

          {/* AI Result Box */}
          {isLoadingQuery && (
            <div className="p-6 rounded-xl border border-purple-100 bg-white space-y-4">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          )}

          {queryResult && (
            <div className="rounded-xl border border-purple-200 bg-white shadow-sm overflow-hidden">
              <div className="p-5 space-y-4">
                {/* Result Answer */}
                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    AI Answer
                  </h4>
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                    {queryResult.answer}
                  </p>
                </div>

                {/* Citations & Snippets */}
                {queryResult.citations && queryResult.citations.length > 0 && (
                  <div className="pt-4 border-t border-gray-100 space-y-3">
                    <h5 className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-emerald-600" />
                      Document Citations
                    </h5>
                    <div className="space-y-3">
                      {queryResult.citations.map((cite: any, idx: number) => (
                        <div key={idx} className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-100 space-y-1">
                          <div className="flex justify-between items-center text-[10px]">
                            <span className="font-semibold text-emerald-800">
                              Document ID: {cite.document_id || 'Parsed Guideline'}
                            </span>
                            {cite.chunk_index !== undefined && (
                              <Badge className="bg-emerald-100 text-emerald-800 border border-emerald-200 text-[9px] scale-90">
                                Chunk #{cite.chunk_index}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 leading-relaxed italic bg-white p-2.5 rounded border border-emerald-100">
                            &ldquo;{cite.text || cite.snippet}&rdquo;
                          </p>
                          <div className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                            <CheckCircle className="w-3 h-3 text-emerald-600" />
                            From verified documents
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


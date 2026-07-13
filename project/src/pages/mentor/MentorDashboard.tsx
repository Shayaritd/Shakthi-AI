import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getMentorProfile, getMentorshipRequests, updateMentorshipRequest, getOrCreateChatThread, getMentoredAthletes } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Users,
  Star,
  Clock,
  Shield,
  CheckCircle,
  AlertTriangle,
  MessageSquare,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

export default function MentorDashboard() {
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();

  const { data: mentorProfile } = useQuery({
    queryKey: ['mentorProfile', user?.id],
    queryFn: () => getMentorProfile(user!.id),
    enabled: !!user,
  });

  const { data: requests } = useQuery({
    queryKey: ['mentorRequests', user?.id],
    queryFn: () => getMentorshipRequests(user!.id, 'mentor'),
    enabled: !!user,
  });

  const { data: activeAthletes = [] } = useQuery({
    queryKey: ['mentoredAthletes', user?.id],
    queryFn: () => getMentoredAthletes(user!.id),
    enabled: !!user,
  });

  const handleRequestStatus = async (requestId: string, status: 'APPROVED' | 'REJECTED', athleteId: string) => {
    try {
      await updateMentorshipRequest(requestId, { status });
      if (status === 'APPROVED') {
        await getOrCreateChatThread(athleteId, user!.id, requestId);
        toast.success('Mentorship request approved! A chat conversation has been started.');
      } else {
        toast.success('Mentorship request rejected.');
      }
      queryClient.invalidateQueries({ queryKey: ['mentorRequests', user?.id] });
    } catch (error: any) {
      toast.error('Failed to update request: ' + error.message);
    }
  };

  const isVerified = mentorProfile?.verified;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome, {profile?.full_name?.split(' ')[0]}!
          </h1>
          <p className="text-gray-500">Mentor Dashboard</p>
        </div>
        <div className="flex items-center gap-2">
          {isVerified ? (
            <Badge className="bg-teal-100 text-teal-700">
              <Shield className="w-3 h-3 mr-1" />
              Verified Mentor
            </Badge>
          ) : (
            <Badge className="bg-amber-100 text-amber-700">Pending Verification</Badge>
          )}
        </div>
      </div>

      {/* Verification Alert */}
      {!isVerified && (
        <Alert className="bg-amber-50 border-amber-200">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            Your mentor profile is pending verification. Complete your profile and upload
            certifications to speed up the process.
          </AlertDescription>
        </Alert>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Athletes Mentored</p>
              <Users className="w-5 h-5 text-teal-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {activeAthletes.length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Rating</p>
              <Star className="w-5 h-5 text-amber-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {mentorProfile?.average_rating ? mentorProfile.average_rating.toFixed(1) : 'New'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Response Time</p>
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {mentorProfile?.response_time_hours ? `${mentorProfile.response_time_hours}h` : '24h'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Active Mentorships</p>
              <MessageSquare className="w-5 h-5 text-rose-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {activeAthletes.length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Requests */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Requests</CardTitle>
          <CardDescription>Athletes waiting for your response</CardDescription>
        </CardHeader>
        <CardContent>
          {requests && requests.filter((r) => r.status === 'PENDING').length > 0 ? (
            <div className="space-y-3">
              {requests
                .filter((r) => r.status === 'PENDING')
                .slice(0, 5)
                .map((req) => {
                  const age = req.athlete?.athlete_profile?.date_of_birth
                    ? new Date().getFullYear() - new Date(req.athlete.athlete_profile.date_of_birth).getFullYear()
                    : null;
                  
                  const isMinor = age !== null && age < 18;

                  return (
                    <div key={req.id} className="p-4 rounded-lg border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-sm transition-shadow">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-teal-700 text-base">
                            {req.athlete?.full_name || 'Anonymous Athlete'}
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            {req.mode}
                          </Badge>
                          
                          {/* Guardian Approval Status Indicator */}
                          {isMinor ? (
                            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">
                              <Shield className="w-3 h-3 mr-1" />
                              Guardian Approved ({req.athlete?.athlete_profile?.guardian_name})
                            </Badge>
                          ) : age !== null ? (
                            <Badge className="bg-gray-100 text-gray-600 border-gray-200">
                              Adult (Guardian Not Required)
                            </Badge>
                          ) : null}
                        </div>

                        {/* Athlete Profile Preview */}
                        <div className="text-xs text-gray-500 bg-gray-50/50 p-2 rounded border border-gray-100 flex flex-wrap gap-4">
                          <span><strong>Sport:</strong> {req.athlete?.athlete_profile?.sport || 'N/A'}</span>
                          <span><strong>Level:</strong> {req.athlete?.athlete_profile?.level || 'N/A'}</span>
                          {age !== null && <span><strong>Age:</strong> {age}</span>}
                        </div>

                        <p className="text-sm font-medium text-gray-800">Goal: {req.goal}</p>
                        {req.message && (
                          <p className="text-xs text-gray-500 bg-amber-50/30 p-2 rounded border italic">
                            "{req.message}"
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2 w-full md:w-auto shrink-0">
                        <Button
                          size="sm"
                          className="bg-teal-600 hover:bg-teal-700 text-white flex-1 md:flex-initial"
                          onClick={() => handleRequestStatus(req.id, 'APPROVED', req.athlete_id)}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-rose-600 border-rose-200 hover:bg-rose-50 flex-1 md:flex-initial"
                          onClick={() => handleRequestStatus(req.id, 'REJECTED', req.athlete_id)}
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No pending requests</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6 flex flex-col items-center text-center">
            <MessageSquare className="w-10 h-10 text-teal-600 mb-3" />
            <h3 className="font-medium">Messages</h3>
            <p className="text-sm text-gray-500 mt-1">Chat with your athletes</p>
            <Button variant="outline" className="mt-4" asChild>
              <Link to="/chat">Open Chat</Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6 flex flex-col items-center text-center">
            <Shield className="w-10 h-10 text-rose-600 mb-3" />
            <h3 className="font-medium">Safety</h3>
            <p className="text-sm text-gray-500 mt-1">Report and view guidelines</p>
            <Button variant="outline" className="mt-4" asChild>
              <Link to="/safety">Safety Center</Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6 flex flex-col items-center text-center">
            <Users className="w-10 h-10 text-blue-600 mb-3" />
            <h3 className="font-medium">Profile</h3>
            <p className="text-sm text-gray-500 mt-1">Update your mentor profile</p>
            <Button variant="outline" className="mt-4" asChild>
              <Link to="/mentor/profile">Edit Profile</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

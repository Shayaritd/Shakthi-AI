import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Heart,
  Users,
  MessageSquare,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  User,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getMentorshipRequests, updateMentorshipRequest } from '@/services/api';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function GuardianDashboard() {
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();

  const { data: requests, isLoading: requestsLoading } = useQuery({
    queryKey: ['guardianRequests', user?.id],
    queryFn: () => getMentorshipRequests(user!.id, 'guardian'),
    enabled: !!user,
  });

  const { data: linkedAthletes, isLoading: athletesLoading } = useQuery({
    queryKey: ['linkedAthletes', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('athlete_profiles')
        .select(`
          *,
          profile:profiles!user_id(*)
        `)
        .eq('guardian_user_id', user!.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const handleGuardianApprove = async (requestId: string) => {
    try {
      await updateMentorshipRequest(requestId, { guardian_approved: true });
      toast.success('Mentorship request approved successfully!');
      queryClient.invalidateQueries({ queryKey: ['guardianRequests', user?.id] });
    } catch (error: any) {
      toast.error('Failed to approve request: ' + error.message);
    }
  };

  const handleGuardianReject = async (requestId: string) => {
    try {
      await updateMentorshipRequest(requestId, { status: 'REJECTED' });
      toast.success('Mentorship request declined successfully!');
      queryClient.invalidateQueries({ queryKey: ['guardianRequests', user?.id] });
    } catch (error: any) {
      toast.error('Failed to decline request: ' + error.message);
    }
  };

  const pendingRequests = requests?.filter(r => r.status === 'PENDING_GUARDIAN' && !r.guardian_approved) || [];
  const historyRequests = requests?.filter(r => r.status !== 'PENDING_GUARDIAN' || r.guardian_approved) || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Guardian Dashboard</h1>
          <p className="text-gray-500">Monitor and support your athlete</p>
        </div>
        <Badge className="bg-rose-100 text-rose-700 self-start">
          <Heart className="w-3 h-3 mr-1" />
          Guardian
        </Badge>
      </div>

      {/* Linked Athletes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Linked Athletes
          </CardTitle>
          <CardDescription>Athletes under your supervision</CardDescription>
        </CardHeader>
        <CardContent>
          {athletesLoading ? (
            <p className="text-sm text-gray-500">Loading athletes...</p>
          ) : linkedAthletes && linkedAthletes.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-4">
              {linkedAthletes.map((athlete) => {
                const age = athlete.date_of_birth 
                  ? new Date().getFullYear() - new Date(athlete.date_of_birth).getFullYear() 
                  : 'N/A';
                return (
                  <div key={athlete.id} className="p-4 rounded-lg border flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold">
                        {athlete.profile?.full_name?.charAt(0) || 'A'}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{athlete.profile?.full_name}</h4>
                        <p className="text-xs text-gray-500">
                          {athlete.sport} • Age: {age} • {athlete.level}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="border-teal-200 text-teal-700 bg-teal-50/50">
                      Active Athlete
                    </Badge>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No athletes linked yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending Approvals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Pending Approvals
          </CardTitle>
          <CardDescription>Mentorship requests requiring your approval</CardDescription>
        </CardHeader>
        <CardContent>
          {requestsLoading ? (
            <p className="text-sm text-gray-500">Loading approvals...</p>
          ) : pendingRequests.length > 0 ? (
            <div className="space-y-3">
              {pendingRequests.map((req) => (
                <div key={req.id} className="p-4 rounded-lg border flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-teal-700">
                        {req.athlete?.full_name || 'Anonymous Athlete'}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        Athlete (Minor)
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      Requested mentor: <span className="font-medium text-gray-800">{req.mentor?.full_name}</span>
                    </p>
                    <p className="text-sm text-gray-500">Goal: {req.goal}</p>
                    {req.message && (
                      <p className="text-xs text-gray-400 italic">"{req.message}"</p>
                    )}
                  </div>
                  <div className="flex gap-2 w-full md:w-auto shrink-0">
                    <Button
                      size="sm"
                      className="bg-teal-600 hover:bg-teal-700 text-white flex-1 md:flex-initial"
                      onClick={() => handleGuardianApprove(req.id)}
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-rose-600 border-rose-200 hover:bg-rose-50 flex-1 md:flex-initial"
                      onClick={() => handleGuardianReject(req.id)}
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No pending approvals</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Approved/Declined Requests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-gray-500" />
            Request History
          </CardTitle>
          <CardDescription>Status of past requests reviewed by you</CardDescription>
        </CardHeader>
        <CardContent>
          {requestsLoading ? (
            <p className="text-sm text-gray-500">Loading history...</p>
          ) : historyRequests.length > 0 ? (
            <div className="space-y-3">
              {historyRequests.map((req) => {
                let statusBadge = (
                  <Badge variant="outline" className="border-amber-200 text-amber-700 bg-amber-50">
                    Pending Mentor
                  </Badge>
                );
                if (req.status === 'APPROVED') {
                  statusBadge = (
                    <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
                      Approved by Mentor
                    </Badge>
                  );
                } else if (req.status === 'REJECTED') {
                  const isGuardianReject = !req.guardian_approved;
                  statusBadge = (
                    <Badge variant="destructive" className="bg-rose-100 text-rose-800 border-rose-200">
                      {isGuardianReject ? 'Rejected by Guardian' : 'Rejected by Mentor'}
                    </Badge>
                  );
                } else if (req.status === 'CANCELLED') {
                  statusBadge = (
                    <Badge variant="secondary" className="bg-gray-100 text-gray-805 border-gray-200">
                      Cancelled
                    </Badge>
                  );
                }

                return (
                  <div key={req.id} className="p-4 rounded-lg border flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">
                          {req.athlete?.full_name}
                        </span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-sm text-gray-500">
                          Mentor: <span className="font-medium text-gray-700">{req.mentor?.full_name}</span>
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">Goal: {req.goal}</p>
                    </div>
                    <div className="shrink-0">{statusBadge}</div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No request history</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6 flex flex-col items-center text-center">
            <MessageSquare className="w-10 h-10 text-teal-600 mb-3" />
            <h3 className="font-medium">Monitor Chats</h3>
            <p className="text-sm text-gray-500 mt-1">View athlete conversations</p>
            <Button variant="outline" className="mt-4" asChild>
              <Link to="/chat">View Chats</Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6 flex flex-col items-center text-center">
            <Shield className="w-10 h-10 text-rose-600 mb-3" />
            <h3 className="font-medium">Safety</h3>
            <p className="text-sm text-gray-500 mt-1">Report concerns</p>
            <Button variant="outline" className="mt-4" asChild>
              <Link to="/safety">Safety Center</Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6 flex flex-col items-center text-center">
            <AlertTriangle className="w-10 h-10 text-amber-600 mb-3" />
            <h3 className="font-medium">Alerts</h3>
            <p className="text-sm text-gray-500 mt-1">Safety notifications</p>
            <Button variant="outline" className="mt-4" asChild>
              <Link to="/notifications">View Alerts</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

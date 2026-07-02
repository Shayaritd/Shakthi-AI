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
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getMentorshipRequests, updateMentorshipRequest } from '@/services/api';
import { toast } from 'sonner';

export default function GuardianDashboard() {
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();

  const { data: requests, isLoading } = useQuery({
    queryKey: ['guardianRequests', user?.id],
    queryFn: () => getMentorshipRequests(user!.id, 'guardian'),
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
          <div className="text-center py-8 text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No athletes linked yet</p>
            <Button variant="outline" className="mt-4">
              Link Athlete
            </Button>
          </div>
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
          {isLoading ? (
            <p className="text-sm text-gray-500">Loading approvals...</p>
          ) : requests && requests.length > 0 ? (
            <div className="space-y-3">
              {requests.map((req) => (
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
                  </div>
                  <Button
                    size="sm"
                    className="bg-teal-600 hover:bg-teal-700 text-white w-full md:w-auto"
                    onClick={() => handleGuardianApprove(req.id)}
                  >
                    Approve Request
                  </Button>
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

function CheckCircle({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

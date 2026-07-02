import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { getAdminStats, getAllSafetyReports, getAllProfiles } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import {
  Users,
  Shield,
  AlertTriangle,
  Award,
  CheckCircle,
  Clock,
  TrendingUp,
  Building,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

export default function AdminDashboard() {
  const { profile } = useAuth();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['adminStats'],
    queryFn: getAdminStats,
  });

  const { data: reports, isLoading: reportsLoading } = useQuery({
    queryKey: ['adminReports'],
    queryFn: () => getAllSafetyReports({ status: 'SUBMITTED' }),
  });

  const { data: mentors, isLoading: mentorsLoading } = useQuery({
    queryKey: ['adminMentors'],
    queryFn: () => getAllProfiles({ role: 'MENTOR', verified: false }),
  });

  const statCards = [
    {
      title: 'Total Athletes',
      value: stats?.totalAthletes || 0,
      icon: Users,
      color: 'bg-teal-100 text-teal-700',
      trend: '+12%',
    },
    {
      title: 'Verified Mentors',
      value: stats?.verifiedMentors || 0,
      icon: CheckCircle,
      color: 'bg-green-100 text-green-700',
      trend: '+5%',
    },
    {
      title: 'Pending Reports',
      value: stats?.pendingReports || 0,
      icon: AlertTriangle,
      color: 'bg-amber-100 text-amber-700',
      trend: '-3%',
    },
    {
      title: 'Active Scholarships',
      value: stats?.activeScholarships || 0,
      icon: Award,
      color: 'bg-blue-100 text-blue-700',
      trend: '+2',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500">Platform overview and management</p>
        </div>
        <Badge className="bg-teal-100 text-teal-700 self-start">Administrator</Badge>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsLoading ? (
          <>
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-3 w-20" />
                </CardContent>
              </Card>
            ))}
          </>
        ) : (
          statCards.map((stat, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">{stat.title}</p>
                  <div className={`w-8 h-8 rounded-lg ${stat.color} flex items-center justify-center`}>
                    <stat.icon className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                <p className="text-xs text-green-600 mt-1">{stat.trend} from last month</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Pending Reports */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Recent Safety Reports</CardTitle>
              <CardDescription>Requires immediate attention</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/admin/safety-reports">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {reportsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 rounded-lg" />
                ))}
              </div>
            ) : reports && reports.length > 0 ? (
              <div className="space-y-3">
                {reports.slice(0, 5).map((report) => (
                  <div
                    key={report.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
                  >
                    <div>
                      <p className="font-medium text-sm">{report.ticket_id}</p>
                      <p className="text-xs text-gray-500">{report.category}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={report.severity === 'EMERGENCY' ? 'destructive' : 'secondary'}
                      >
                        {report.severity}
                      </Badge>
                      <p className="text-xs text-gray-400">
                        {format(new Date(report.created_at), 'MMM d')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No pending reports</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Mentor Verification Queue */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Mentor Verification Queue</CardTitle>
              <CardDescription>Pending verification requests</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/admin/mentor-verification">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {mentorsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 rounded-lg" />
                ))}
              </div>
            ) : mentors && mentors.length > 0 ? (
              <div className="space-y-3">
                {mentors.slice(0, 5).map((mentor) => (
                  <div
                    key={mentor.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center">
                        <span className="text-teal-700 font-medium">
                          {mentor.full_name?.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">{mentor.full_name}</p>
                        <p className="text-xs text-gray-500">{mentor.state}</p>
                      </div>
                    </div>
                    <Button size="sm">Review</Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No pending verifications</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-auto py-4 flex-col" asChild>
              <Link to="/admin/mentor-verification">
                <Users className="w-5 h-5 mb-2" />
                Verify Mentors
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col" asChild>
              <Link to="/admin/safety-reports">
                <Shield className="w-5 h-5 mb-2" />
                Safety Reports
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col" asChild>
              <Link to="/colleges">
                <Building className="w-5 h-5 mb-2" />
                Manage Colleges
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col" asChild>
              <Link to="/opportunities">
                <Award className="w-5 h-5 mb-2" />
                Opportunities
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

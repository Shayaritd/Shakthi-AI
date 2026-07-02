import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getAthleteProfile, getMentors, getScholarships, getNotifications } from '@/services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Users,
  Award,
  Calendar,
  TrendingUp,
  ChevronRight,
  Shield,
  Star,
  Target,
  MessageSquare,
  Bell,
} from 'lucide-react';
import { format } from 'date-fns';

export default function AthleteDashboard() {
  const { user, profile } = useAuth();

  const { data: athleteProfile, isLoading: profileLoading } = useQuery({
    queryKey: ['athleteProfile', user?.id],
    queryFn: () => (user ? getAthleteProfile(user.id) : null),
    enabled: !!user,
  });

  const { data: mentors, isLoading: mentorsLoading } = useQuery({
    queryKey: ['mentors', 'recommended'],
    queryFn: () => getMentors({ verified: true }),
  });

  const { data: scholarships, isLoading: scholarshipsLoading } = useQuery({
    queryKey: ['scholarships', 'matches'],
    queryFn: () => getScholarships({ girlsOnly: true }),
  });

  const { data: notifications } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: () => (user ? getNotifications(user.id) : []),
    enabled: !!user,
  });

  const completion = athleteProfile?.profile_completion || 0;

  const quickActions = [
    {
      label: 'Find Mentors',
      description: 'Connect with verified coaches',
      icon: Users,
      href: '/mentors',
      color: 'bg-teal-100 text-teal-700',
    },
    {
      label: 'Scholarships',
      description: 'Discover funding opportunities',
      icon: Award,
      href: '/scholarships',
      color: 'bg-amber-100 text-amber-700',
    },
    {
      label: 'Opportunities',
      description: 'Upcoming events and trials',
      icon: Calendar,
      href: '/opportunities',
      color: 'bg-blue-100 text-blue-700',
    },
    {
      label: 'Training',
      description: 'Learn and improve skills',
      icon: Target,
      href: '/training',
      color: 'bg-rose-100 text-rose-700',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome, {profile?.full_name?.split(' ')[0]}!
          </h1>
          <p className="text-gray-500">Here&apos;s your sports journey at a glance</p>
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

      {/* Profile Completion Card */}
      {completion < 100 && (
        <Card className="bg-gradient-to-r from-teal-50 to-teal-100 border-teal-200">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <h3 className="font-semibold text-teal-900">Complete Your Profile</h3>
                <p className="text-sm text-teal-700">
                  A complete profile helps mentors find you and improves scholarship matches.
                </p>
                <Progress value={completion} className="h-2 bg-teal-200" />
                <p className="text-sm font-medium text-teal-800">{completion}% Complete</p>
              </div>
              <Button asChild className="bg-teal-600 hover:bg-teal-700">
                <Link to="/athlete/profile">
                  Complete Now
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action) => (
          <Link key={action.href} to={action.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardContent className="p-4 flex flex-col items-center text-center justify-center h-full">
                <div className={`w-12 h-12 rounded-xl ${action.color} flex items-center justify-center mb-3`}>
                  <action.icon className="w-6 h-6" />
                </div>
                <h3 className="font-medium text-gray-900 text-sm">{action.label}</h3>
                <p className="text-xs text-gray-500 mt-1">{action.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recommended Mentors */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Recommended Mentors</CardTitle>
              <CardDescription>Verified coaches matching your profile</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/mentors">
                View All
                <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {mentorsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="w-12 h-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            ) : mentors && mentors.length > 0 ? (
              <div className="space-y-4">
                {mentors.slice(0, 3).map((mentor) => (
                  <div
                    key={mentor.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center">
                        <span className="text-teal-700 font-medium">
                          {mentor.profile?.full_name?.charAt(0) || 'M'}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 flex items-center gap-2">
                          {mentor.profile?.full_name}
                          {mentor.verified && (
                            <Badge variant="secondary" className="bg-teal-100 text-teal-700 text-xs">
                              <Shield className="w-3 h-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                        </p>
                        <p className="text-sm text-gray-500">
                          {mentor.expertise.join(', ')} • {mentor.experience_years} years
                        </p>
                      </div>
                    </div>
                    <Button size="sm" asChild>
                      <Link to={`/mentors/${mentor.user_id}`}>View</Link>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No mentors available yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Activity Summary */}
        <div className="space-y-6">
          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Active Mentors</p>
                    <p className="text-xl font-bold text-gray-900">0</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                    <Award className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Saved Scholarships</p>
                    <p className="text-xl font-bold text-gray-900">0</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Upcoming Events</p>
                    <p className="text-xl font-bold text-gray-900">0</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Notifications */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Notifications</CardTitle>
              <Link to="/notifications" className="text-sm text-teal-600 hover:text-teal-700">
                View All
              </Link>
            </CardHeader>
            <CardContent>
              {notifications && notifications.length > 0 ? (
                <div className="space-y-3">
                  {notifications.slice(0, 3).map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-3 rounded-lg ${notif.read ? 'bg-gray-50' : 'bg-teal-50 border border-teal-100'}`}
                    >
                      <p className="text-sm font-medium text-gray-900">{notif.title}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {format(new Date(notif.created_at), 'MMM d, h:mm a')}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No notifications yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Scholarship Matches */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">Scholarship Matches</CardTitle>
            <CardDescription>Opportunities based on your profile</CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/scholarships">
              View All
              <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {scholarshipsLoading ? (
            <div className="grid md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32 rounded-lg" />
              ))}
            </div>
          ) : scholarships && scholarships.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-4">
              {scholarships.slice(0, 3).map((scholarship) => (
                <Link key={scholarship.id} to={`/scholarships/${scholarship.id}`}>
                  <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900 line-clamp-1">{scholarship.name}</h4>
                          <p className="text-sm text-gray-500">{scholarship.provider}</p>
                        </div>
                        {scholarship.girls_only && (
                          <Badge className="bg-rose-100 text-rose-700">Girls Only</Badge>
                        )}
                      </div>
                      <div className="mt-3 flex items-center gap-2 text-teal-600">
                        <span className="text-lg font-bold">
                          ₹{scholarship.amount?.toLocaleString() || 'Variable'}
                        </span>
                      </div>
                      {scholarship.deadline && (
                        <p className="text-xs text-gray-500 mt-2">
                          Deadline: {format(new Date(scholarship.deadline), 'MMM d, yyyy')}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Award className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No scholarship matches yet</p>
              <Button variant="link" asChild className="mt-2">
                <Link to="/scholarships">Browse Scholarships</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

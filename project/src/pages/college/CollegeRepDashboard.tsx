import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Building,
  Calendar,
  MessageSquare,
  Shield,
  TrendingUp
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CollegeRepDashboard() {
  const { profile } = useAuth();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">College Portal</h1>
          <p className="text-gray-500">Welcome, {profile?.full_name || 'Representative'}. Manage your university/college sports quota admission channels.</p>
        </div>
        <Badge className="bg-amber-100 text-amber-800 self-start">
          <Building className="w-3 h-3 mr-1" />
          College Representative
        </Badge>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-5 space-y-2">
            <span className="text-sm font-medium text-gray-500">Sports Quotas Open</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-gray-900">3</span>
              <span className="text-xs text-green-600 font-semibold flex items-center">
                <TrendingUp className="w-3 h-3 mr-0.5" />
                Active
              </span>
            </div>
            <p className="text-xs text-gray-500">Basketball, Athletics, and Kabaddi.</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-5 space-y-2">
            <span className="text-sm font-medium text-gray-500">Admission Applications</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-gray-900">18</span>
            </div>
            <p className="text-xs text-gray-500">Applications received under sports quota.</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-5 space-y-2">
            <span className="text-sm font-medium text-gray-500">Fee Concessions Awarded</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-gray-900">₹2.8L</span>
            </div>
            <p className="text-xs text-gray-500">Fee support granted to sports quota students.</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Section */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5 text-teal-600" />
                University Sports Profile
              </CardTitle>
              <CardDescription>Configure admission details and sports quota requirements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 rounded-xl border bg-gray-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="space-y-1">
                    <h4 className="font-bold text-gray-900 text-sm">Sports Quota Admission Rules</h4>
                    <p className="text-xs text-gray-500">Minimum state-level participation certificate required. 50% concession on tuition fees.</p>
                  </div>
                  <Button size="sm" variant="outline" asChild>
                    <Link to="/colleges">Manage College Profile</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>College Representative Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full bg-teal-600 hover:bg-teal-700" asChild>
                <Link to="/colleges">
                  <Building className="w-4 h-4 mr-2" />
                  View All Colleges
                </Link>
              </Button>
              <Button className="w-full" variant="outline" asChild>
                <Link to="/chat">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Chat Channels
                </Link>
              </Button>
              <Button className="w-full" variant="outline" asChild>
                <Link to="/safety">
                  <Shield className="w-4 h-4 mr-2" />
                  Safety Center
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Award,
  MessageSquare,
  Shield,
  Briefcase,
  TrendingUp
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function SponsorDashboard() {
  const { profile } = useAuth();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sponsor Portal</h1>
          <p className="text-gray-500">Welcome, {profile?.full_name || 'Partner'}. Manage your corporate/foundation sponsorship programs.</p>
        </div>
        <Badge className="bg-emerald-100 text-emerald-800 self-start">
          <Briefcase className="w-3 h-3 mr-1" />
          Sponsor Account
        </Badge>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-5 space-y-2">
            <span className="text-sm font-medium text-gray-500">Active Programs</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-gray-900">2</span>
              <span className="text-xs text-emerald-600 font-semibold flex items-center">
                <TrendingUp className="w-3 h-3 mr-0.5" />
                Active
              </span>
            </div>
            <p className="text-xs text-gray-500">Corporate & sports excellence scholarships.</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-5 space-y-2">
            <span className="text-sm font-medium text-gray-500">Total Funds Disbursed</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-gray-900">₹4.5L</span>
            </div>
            <p className="text-xs text-gray-500">Distributed across rural girl athletes.</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-5 space-y-2">
            <span className="text-sm font-medium text-gray-500">Sponsored Athletes</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-gray-900">12</span>
            </div>
            <p className="text-xs text-gray-500">Talented girls supported in multiple sports.</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Section */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-teal-600" />
                Your Active Scholarship Programs
              </CardTitle>
              <CardDescription>Verify and manage applicants for your programs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 rounded-xl border bg-gray-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-gray-900 text-sm">SHAKTHI Rural Sports Grant</h4>
                      <Badge className="bg-amber-100 text-amber-800 text-xs">OPEN</Badge>
                    </div>
                    <p className="text-xs text-gray-500">Aiming to support athletic girls in rural Haryana and Maharashtra.</p>
                    <p className="text-[11px] text-teal-600 font-medium">5 Applicants Pending Review</p>
                  </div>
                  <Button size="sm" variant="outline" asChild>
                    <Link to="/scholarships">Browse Candidates</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sponsorship Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full bg-teal-600 hover:bg-teal-700" asChild>
                <Link to="/scholarships">
                  <Award className="w-4 h-4 mr-2" />
                  View All Scholarships
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

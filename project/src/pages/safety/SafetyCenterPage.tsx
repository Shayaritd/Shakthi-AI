import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  FileText,
  Phone,
  Mail,
  MessageSquare,
  Lock,
  Users,
  Heart,
  Award,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';

export default function SafetyCenterPage() {
  const { profile } = useAuth();

  const safetyFeatures = [
    {
      icon: CheckCircle,
      title: 'Verified Mentors',
      description: 'All mentors undergo identity verification, background checks, and reference validation.',
    },
    {
      icon: Lock,
      title: 'Guardian Visibility',
      description: 'Parents can view all chats between athletes and mentors for complete transparency.',
    },
    {
      icon: AlertTriangle,
      title: 'Instant Reporting',
      description: 'Report any concern instantly through the app - anonymously if needed.',
    },
    {
      icon: Mail,
      title: '24/7 Support',
      description: 'Our safety team is available around the clock for urgent concerns.',
    },
  ];

  const safetyPromisePoints = [
    'All mentors sign a strict code of conduct',
    'Background checks and reference verification',
    'AI moderation of chat messages',
    'Guardian approval required for minors',
    'Anonymous reporting with guaranteed investigation',
    'Immediate action on safety reports',
    'Regular safety audits and reviews',
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Safety Center</h1>
          <p className="text-gray-500">Your safety is our highest priority</p>
        </div>
        <Button asChild className="bg-rose-600 hover:bg-rose-700">
          <Link to="/safety/report">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Report an Issue
          </Link>
        </Button>
      </div>

      {/* Emergency Alert */}
      <Alert className="bg-rose-50 border-rose-200">
        <Phone className="w-5 h-5 text-rose-600" />
        <AlertTitle className="text-rose-800">Need immediate help?</AlertTitle>
        <AlertDescription className="text-rose-700">
          If you are in danger or need immediate assistance, please call emergency services at{' '}
          <strong>112</strong> or women helpline at <strong>181</strong>.
        </AlertDescription>
      </Alert>

      {/* Safety Promise */}
      <Card className="bg-gradient-to-r from-teal-50 to-teal-100 border-teal-200">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-teal-600 flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-teal-900">SHAKTHI Safety Promise</CardTitle>
              <CardDescription className="text-teal-700">
                Our commitment to protecting every athlete
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {safetyPromisePoints.map((point, i) => (
              <div key={i} className="flex items-start gap-3 text-teal-800">
                <CheckCircle className="w-5 h-5 text-teal-600 mt-0.5 shrink-0" />
                <span className="text-sm">{point}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Safety Features */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {safetyFeatures.map((feature, i) => (
          <Card key={i} className="bg-white">
            <CardContent className="p-4">
              <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center mb-3">
                <feature.icon className="w-5 h-5 text-teal-600" />
              </div>
              <h3 className="font-medium text-gray-900">{feature.title}</h3>
              <p className="text-sm text-gray-500 mt-1">{feature.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* What to Report */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            When to Report
          </CardTitle>
          <CardDescription>Report any behavior that makes you uncomfortable</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { label: 'Harassment or inappropriate behavior', severity: 'urgent' },
              { label: 'Fraud or misrepresentation', severity: 'urgent' },
              { label: 'Unsafe meeting conduct', severity: 'emergency' },
              { label: 'Pressure to share personal content', severity: 'urgent' },
              { label: 'Discriminatory language', severity: 'normal' },
              { label: 'Any other safety concern', severity: 'normal' },
            ].map((item, i) => (
              <div
                key={i}
                className={`p-3 rounded-lg flex items-center gap-3 ${
                  item.severity === 'emergency'
                    ? 'bg-rose-100 text-rose-800'
                    : item.severity === 'urgent'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-gray-100 text-gray-800'
                }`}
              >
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span className="text-sm">{item.label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Guardian Section */}
      {profile?.role === 'ATHLETE' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-600" />
              Guardian Involvement
            </CardTitle>
            <CardDescription>How we keep your parents informed and in control</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-4 p-4 rounded-lg bg-gray-50">
              <Users className="w-6 h-6 text-teal-600 mt-1" />
              <div>
                <h4 className="font-medium">Parent/Guardian Visibility</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Your guardian can view your mentorship conversations and approve connections with
                  mentors. This transparency keeps everyone safe and informed.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 rounded-lg bg-gray-50">
              <CheckCircle className="w-6 h-6 text-teal-600 mt-1" />
              <div>
                <h4 className="font-medium">Mentor Approval for Minors</h4>
                <p className="text-sm text-gray-600 mt-1">
                  For athletes under 18, your guardian must approve each mentor connection before
                  mentorship begins.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6 flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-full bg-rose-100 flex items-center justify-center mb-3">
              <AlertTriangle className="w-7 h-7 text-rose-600" />
            </div>
            <h3 className="font-medium text-gray-900">Report an Issue</h3>
            <p className="text-sm text-gray-500 mt-1">
              Submit a safety concern confidentially
            </p>
            <Button asChild className="mt-4">
              <Link to="/safety/report">
                Report Now
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6 flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-full bg-teal-100 flex items-center justify-center mb-3">
              <FileText className="w-7 h-7 text-teal-600" />
            </div>
            <h3 className="font-medium text-gray-900">Track Report</h3>
            <p className="text-sm text-gray-500 mt-1">
              Check status of your submitted reports
            </p>
            <Button asChild variant="outline" className="mt-4">
              <Link to="/safety/report">View Reports</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6 flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center mb-3">
              <MessageSquare className="w-7 h-7 text-blue-600" />
            </div>
            <h3 className="font-medium text-gray-900">Contact Support</h3>
            <p className="text-sm text-gray-500 mt-1">
              Talk to our safety team directly
            </p>
            <Button asChild variant="outline" className="mt-4">
              <Link to="/help">Get Help</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Emergency Contacts */}
      <Card className="bg-gray-900 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Phone className="w-5 h-5" />
            Emergency Contacts
          </CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-gray-800">
            <p className="font-medium">Emergency Services</p>
            <p className="text-3xl font-bold mt-2">112</p>
          </div>
          <div className="p-4 rounded-lg bg-gray-800">
            <p className="font-medium">Women Helpline</p>
            <p className="text-3xl font-bold mt-2">181</p>
          </div>
          <div className="p-4 rounded-lg bg-gray-800">
            <p className="font-medium">Child Helpline</p>
            <p className="text-3xl font-bold mt-2">1098</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

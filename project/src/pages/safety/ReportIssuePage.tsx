import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { createSafetyReport } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  AlertTriangle,
  Shield,
  Phone,
  Lock,
  Loader2,
  CheckCircle,
  ArrowLeft,
  AlertCircle,
} from 'lucide-react';
import { REPORT_CATEGORIES, REPORT_SEVERITIES } from '@/constants/theme';

export default function ReportIssuePage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialReportedUserId = queryParams.get('userId') || '';

  const [submitted, setSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState('');

  const [category, setCategory] = useState('');
  const [severity, setSeverity] = useState('NORMAL');
  const [description, setDescription] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [reportedUserId, setReportedUserId] = useState(initialReportedUserId);

  const mutation = useMutation({
    mutationFn: () =>
      createSafetyReport({
        reporterId: user!.id,
        reportedUserId: reportedUserId || undefined,
        category,
        severity,
        description,
        anonymous,
      }),
    onSuccess: (data) => {
      setTicketId(data.ticket_id);
      setSubmitted(true);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate();
  };

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-teal-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Report Submitted</h2>
            <p className="text-gray-600 mb-4">
              Your report has been submitted and will be reviewed by our safety team.
            </p>
            <div className="p-4 rounded-lg bg-gray-50 mb-6">
              <p className="text-sm text-gray-500">Your Ticket ID</p>
              <p className="text-2xl font-bold text-teal-700">{ticketId}</p>
            </div>
            <p className="text-sm text-gray-500 mb-6">
              Please save this ticket ID for future reference. You can track your report status
              using this ID.
            </p>
            <div className="flex justify-center gap-4">
              <Button asChild>
                <Link to={`/safety/report/${ticketId}`}>Track Report</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/safety">Back to Safety</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <Button variant="ghost" onClick={() => navigate(-1)}>
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back
      </Button>

      {/* Emergency Alert */}
      <Alert className="bg-rose-50 border-rose-200">
        <Phone className="w-4 h-4 text-rose-600" />
        <AlertTitle className="text-rose-800">In immediate danger?</AlertTitle>
        <AlertDescription className="text-rose-700">
          If you are in danger right now, please call emergency services at{' '}
          <strong className="text-rose-800">112</strong> or women helpline at{' '}
          <strong className="text-rose-800">181</strong>.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-rose-100 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-rose-600" />
            </div>
            <div>
              <CardTitle>Report an Issue</CardTitle>
              <CardDescription>
                Your report will be handled confidentially and investigated promptly
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="category">What happened? *</Label>
              <Select value={category} onValueChange={setCategory} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select the type of issue" />
                </SelectTrigger>
                <SelectContent>
                  {REPORT_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      <div className="flex items-center gap-2">
                        {cat.label}
                        {cat.severity === 'EMERGENCY' && (
                          <Badge className="bg-rose-100 text-rose-700 text-xs">Urgent</Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="severity">Severity Level</Label>
              <Select value={severity} onValueChange={setSeverity}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REPORT_SEVERITIES.map((sev) => (
                    <SelectItem key={sev.value} value={sev.value}>
                      <div className="flex items-center gap-2">
                        <span className={sev.color}>{sev.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="userId">Reported User ID (Optional)</Label>
              <Input
                id="userId"
                placeholder="If reporting a specific user, enter their ID"
                value={reportedUserId}
                onChange={(e) => setReportedUserId(e.target.value)}
              />
              <p className="text-xs text-gray-500">
                You can find user IDs in chat or profiles. Leave blank if unsure.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Describe what happened *</Label>
              <Textarea
                id="description"
                placeholder="Please provide as much detail as possible about the incident..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={6}
                required
              />
            </div>

            <div className="flex items-start space-x-3 p-4 rounded-lg bg-gray-50">
              <Checkbox
                id="anonymous"
                checked={anonymous}
                onCheckedChange={(checked) => setAnonymous(checked as boolean)}
              />
              <div>
                <label htmlFor="anonymous" className="font-medium text-sm cursor-pointer">
                  Submit anonymously
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  Your identity will be hidden from the reported user, but our safety team can
                  still investigate.
                </p>
              </div>
            </div>

            <div className="bg-teal-50 p-4 rounded-lg space-y-3">
              <div className="flex items-center gap-2 text-teal-700">
                <Shield className="w-4 h-4" />
                <span className="font-medium text-sm">Your Safety Guarantee</span>
              </div>
              <ul className="text-sm text-teal-700 space-y-1">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  Your report will be reviewed within 24 hours
                </li>
                <li className="flex items-center gap-2">
                  <Lock className="w-4 h-4 shrink-0" />
                  All reports are strictly confidential
                </li>
                <li className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  Emergency reports are escalated immediately
                </li>
              </ul>
            </div>

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-rose-600 hover:bg-rose-700"
                disabled={mutation.isPending || !category || !description}
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Submit Report
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

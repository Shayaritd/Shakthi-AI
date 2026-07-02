import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { getMentorById, createMentorshipRequest } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  ChevronLeft,
  Shield,
  User,
  MessageSquare,
  Target,
  Calendar,
  Loader2,
  CheckCircle,
  AlertCircle,
  Heart,
} from 'lucide-react';
import { MENTORSHIP_MODES } from '@/constants/theme';

export default function RequestMentorshipPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [goal, setGoal] = useState('');
  const [mode, setMode] = useState('ONLINE');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const { data: mentor, isLoading } = useQuery({
    queryKey: ['mentor', id],
    queryFn: () => getMentorById(id!),
    enabled: !!id,
  });

  const mutation = useMutation({
    mutationFn: () =>
      createMentorshipRequest({
        athleteId: user!.id,
        mentorId: id!,
        goal,
        mode,
        message,
      }),
    onSuccess: () => {
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
            <h2 className="text-xl font-bold text-gray-900 mb-2">Request Sent!</h2>
            <p className="text-gray-600 mb-6">
              Your mentorship request has been sent to {mentor?.profile?.full_name}. You&apos;ll be notified
              when they respond.
            </p>
            <div className="flex justify-center gap-4">
              <Button asChild>
                <Link to="/dashboard/athlete">Back to Dashboard</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/mentors">Find More Mentors</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (!mentor) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-bold text-gray-900">Mentor not found</h2>
        <Button asChild className="mt-4">
          <Link to="/mentors">Back to Mentors</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <Button variant="ghost" asChild>
        <Link to={`/mentors/${id}`}>
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Mentor Profile
        </Link>
      </Button>

      {/* Mentor Summary */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={mentor.profile?.avatar_url} />
              <AvatarFallback className="bg-teal-100 text-teal-700 text-xl font-bold">
                {mentor.profile?.full_name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold">{mentor.profile?.full_name}</h2>
                {mentor.verified && <Shield className="w-4 h-4 text-teal-600" />}
              </div>
              <p className="text-sm text-gray-500">{mentor.expertise.join(', ')}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Guardian Info Alert for Minors */}
      <Alert className="bg-rose-50 border-rose-200">
        <Heart className="w-4 h-4 text-rose-600" />
        <AlertTitle>Guardian Approval</AlertTitle>
        <AlertDescription className="text-rose-700">
          For athletes under 18, your guardian will be notified and must approve this
          mentorship before it begins.
        </AlertDescription>
      </Alert>

      {/* Request Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Request Mentorship
          </CardTitle>
          <CardDescription>
            Tell the mentor about your goals and why you&apos;d like their guidance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="goal">Your Goal *</Label>
              <Select value={goal} onValueChange={setGoal}>
                <SelectTrigger>
                  <SelectValue placeholder="What do you want to achieve?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="skill-improvement">Skill Improvement</SelectItem>
                  <SelectItem value="competition-prep">Competition Preparation</SelectItem>
                  <SelectItem value="career-guidance">Career Guidance</SelectItem>
                  <SelectItem value="mental-training">Mental Training</SelectItem>
                  <SelectItem value="nutrition-advice">Nutrition Advice</SelectItem>
                  <SelectItem value="college-recruitment">College/Sports Quota Guidance</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mode">Preferred Mode *</Label>
              <Select value={mode} onValueChange={setMode}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MENTORSHIP_MODES.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      <div className="flex items-center gap-2">
                        {m.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message to Mentor *</Label>
              <Textarea
                id="message"
                placeholder="Introduce yourself, share your achievements, and explain why you'd like this mentor's guidance..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                required
              />
            </div>

            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <div className="flex items-center gap-2 text-teal-700">
                <Shield className="w-4 h-4" />
                <span className="font-medium text-sm">Safety Commitments</span>
              </div>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-teal-600 mt-0.5 shrink-0" />
                  All conversations are monitored for safety
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-teal-600 mt-0.5 shrink-0" />
                  Guardian will have visibility into this mentorship
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-teal-600 mt-0.5 shrink-0" />
                  You can report any concerns anonymously at any time
                </li>
              </ul>
            </div>

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" asChild>
                <Link to={`/mentors/${id}`}>Cancel</Link>
              </Button>
              <Button
                type="submit"
                className="bg-teal-600 hover:bg-teal-700"
                disabled={mutation.isPending || !goal || !message}
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending Request...
                  </>
                ) : (
                  <>
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Send Request
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

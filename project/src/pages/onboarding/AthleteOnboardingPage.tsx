import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { createAthleteProfile, calculateProfileCompletion } from '@/services/api';
import type { AthleteLevel, AthleteProfile } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  ChevronRight,
  ChevronLeft,
  Loader2,
  Trophy,
  Target,
  Heart,
  Shield,
  Camera,
  Calendar,
  MapPin,
  Award,
} from 'lucide-react';
import { SPORTS_LIST, INDIAN_STATES, ATHLETE_LEVELS } from '@/constants/theme';

const steps = [
  { id: 1, title: 'Basic Info', icon: Target, description: 'Your sport and level' },
  { id: 2, title: 'Location', icon: MapPin, description: 'Where you train' },
  { id: 3, title: 'Goals', icon: Trophy, description: 'Your aspirations' },
  { id: 4, title: 'Guardian', icon: Heart, description: 'Parent details' },
];

export default function AthleteOnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<{
    sport: string;
    position: string;
    level: AthleteLevel;
    district: string;
    state: string;
    date_of_birth: string;
    bio: string;
    goals: string;
    guardian_name: string;
    guardian_phone: string;
    guardian_email: string;
  }>({
    sport: '',
    position: '',
    level: 'SCHOOL',
    district: '',
    state: '',
    date_of_birth: '',
    bio: '',
    goals: '',
    guardian_name: '',
    guardian_phone: '',
    guardian_email: '',
  });

  // Load draft from localStorage on mount/user load
  useEffect(() => {
    if (user?.id) {
      const draft = localStorage.getItem(`athlete_onboarding_draft_${user.id}`);
      if (draft) {
        try {
          const parsed = JSON.parse(draft);
          if (parsed.formData) setFormData(parsed.formData);
          if (parsed.currentStep !== undefined) setCurrentStep(parsed.currentStep);
        } catch (e) {
          console.error('Error parsing onboarding draft:', e);
        }
      }
    }
  }, [user?.id]);

  // Save draft to localStorage when formData or currentStep changes
  useEffect(() => {
    if (user?.id) {
      localStorage.setItem(
        `athlete_onboarding_draft_${user.id}`,
        JSON.stringify({ formData, currentStep })
      );
    }
  }, [formData, currentStep, user?.id]);

  const progress = ((currentStep + 1) / steps.length) * 100;
  const completion = calculateProfileCompletion(formData);

  const updateForm = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep === 0) {
      if (!formData.sport) {
        setError('Please select your primary sport before continuing.');
        return;
      }
    }
    if (currentStep === 1) {
      if (!formData.state || !formData.district.trim()) {
        setError('Please select your state and enter your district before continuing.');
        return;
      }
    }
    setError(null);
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    setError(null);
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!user) return;
    
    if (!formData.sport) {
      setError('Please select your primary sport.');
      setCurrentStep(0);
      return;
    }
    if (!formData.state || !formData.district.trim()) {
      setError('Please select your state and enter your district.');
      setCurrentStep(1);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await createAthleteProfile({
        user_id: user.id,
        sport: formData.sport,
        position: formData.position,
        level: formData.level as AthleteLevel,
        district: formData.district,
        state: formData.state,
        date_of_birth: formData.date_of_birth || undefined,
        bio: formData.bio,
        goals: formData.goals,
        guardian_name: formData.guardian_name,
        guardian_phone: formData.guardian_phone,
        guardian_email: formData.guardian_email,
        preferred_language: 'en',
        profile_completion: completion,
      });

      localStorage.removeItem(`athlete_onboarding_draft_${user.id}`);
      await queryClient.invalidateQueries({ queryKey: ['athleteProfile', user.id] });
      navigate('/dashboard/athlete');
    } catch (err: any) {
      setError(err.message || 'Failed to create profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const StepIcon = steps[currentStep].icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-amber-50 flex flex-col">
      {/* Header */}
      <header className="p-4 sm:p-6">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-600 to-teal-800 flex items-center justify-center">
              <span className="text-white font-bold">S</span>
            </div>
            <span className="font-bold text-teal-900">SHAKTHI</span>
          </div>
          <Badge variant="outline" className="text-sm">
            Step {currentStep + 1} of {steps.length}
          </Badge>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between mt-2 px-1">
            {steps.map((step, i) => (
              <div
                key={step.id}
                className={`flex items-center gap-1.5 text-xs ${
                  i <= currentStep ? 'text-teal-600' : 'text-gray-400'
                }`}
              >
                <step.icon className="w-3 h-3" />
                <span className="hidden sm:inline">{step.title}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-xl">
          <Card className="border-0 shadow-xl">
            <CardHeader className="text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-teal-100 flex items-center justify-center mb-4">
                <StepIcon className="w-8 h-8 text-teal-600" />
              </div>
              <CardTitle className="text-2xl">{steps[currentStep].title}</CardTitle>
              <CardDescription>{steps[currentStep].description}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {error ? (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : null}

              {currentStep === 0 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="sport">Your Primary Sport *</Label>
                    <Select value={formData.sport} onValueChange={(v) => updateForm('sport', v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your sport" />
                      </SelectTrigger>
                      <SelectContent>
                        {SPORTS_LIST.map((sport) => (
                          <SelectItem key={sport} value={sport}>
                            {sport}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="position">Position/Event (Optional)</Label>
                    <Input
                      id="position"
                      placeholder="e.g., Sprinter, Goalkeeper, All-rounder"
                      value={formData.position}
                      onChange={(e) => updateForm('position', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="level">Current Achievement Level *</Label>
                    <Select value={formData.level} onValueChange={(v) => updateForm('level', v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ATHLETE_LEVELS.map((level) => (
                          <SelectItem key={level.value} value={level.value}>
                            {level.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dob">Date of Birth</Label>
                    <Input
                      id="dob"
                      type="date"
                      value={formData.date_of_birth}
                      onChange={(e) => updateForm('date_of_birth', e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Location */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="state">State *</Label>
                    <Select value={formData.state} onValueChange={(v) => updateForm('state', v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your state" />
                      </SelectTrigger>
                      <SelectContent>
                        {INDIAN_STATES.map((state) => (
                          <SelectItem key={state} value={state}>
                            {state}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="district">District *</Label>
                    <Input
                      id="district"
                      placeholder="Enter your district"
                      value={formData.district}
                      onChange={(e) => updateForm('district', e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Goals */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="bio">About You</Label>
                    <Textarea
                      id="bio"
                      placeholder="Tell mentors about yourself - your journey, achievements, what drives you..."
                      value={formData.bio}
                      onChange={(e) => updateForm('bio', e.target.value)}
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="goals">Your Goals</Label>
                    <Textarea
                      id="goals"
                      placeholder="What do you want to achieve? e.g., Get selected for state team, improve timing, find a scholarship..."
                      value={formData.goals}
                      onChange={(e) => updateForm('goals', e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>
              )}

              {/* Step 4: Guardian */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-teal-700 bg-teal-50 p-3 rounded-lg">
                    <Shield className="w-4 h-4" />
                    <span>
                      For athletes under 18, guardian details help us ensure a safe experience.
                    </span>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="guardian_name">Guardian&apos;s Name</Label>
                    <Input
                      id="guardian_name"
                      placeholder="Enter parent/guardian's name"
                      value={formData.guardian_name}
                      onChange={(e) => updateForm('guardian_name', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="guardian_phone">Guardian&apos;s Phone</Label>
                    <Input
                      id="guardian_phone"
                      type="tel"
                      placeholder="+91 9876543210"
                      value={formData.guardian_phone}
                      onChange={(e) => updateForm('guardian_phone', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="guardian_email">Guardian&apos;s Email (Optional)</Label>
                    <Input
                      id="guardian_email"
                      type="email"
                      placeholder="parent@example.com"
                      value={formData.guardian_email}
                      onChange={(e) => updateForm('guardian_email', e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between pt-4">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={currentStep === 0}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Back
                </Button>

                {currentStep < steps.length - 1 ? (
                  <Button onClick={handleNext} className="bg-teal-600 hover:bg-teal-700">
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    className="bg-teal-600 hover:bg-teal-700"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                        Creating Profile...
                      </>
                    ) : (
                      <>
                        <Award className="mr-2 w-4 h-4" />
                        Complete Setup
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              Profile completion: {completion}%
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

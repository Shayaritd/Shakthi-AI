import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { createMentorProfile } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  ChevronRight,
  ChevronLeft,
  Loader2,
  Briefcase,
  Globe,
  Award,
  BookOpen,
} from 'lucide-react';
import { SPORTS_LIST, INDIAN_STATES } from '@/constants/theme';
import { toast } from 'sonner';

const steps = [
  { id: 1, title: 'Expertise', icon: Briefcase, description: 'Your sports background' },
  { id: 2, title: 'Methodology', icon: BookOpen, description: 'How you guide athletes' },
];

export default function MentorOnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    sport: '',
    experienceYears: '',
    bio: '',
    languages: 'English, Hindi',
    availability: 'Weekend, Evening',
    trainingPhilosophy: '',
    district: '',
    state: '',
  });

  // Load draft from localStorage on mount/user load
  useEffect(() => {
    if (user?.id) {
      const draft = localStorage.getItem(`mentor_onboarding_draft_${user.id}`);
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
        `mentor_onboarding_draft_${user.id}`,
        JSON.stringify({ formData, currentStep })
      );
    }
  }, [formData, currentStep, user?.id]);

  const progress = ((currentStep + 1) / steps.length) * 100;

  const updateForm = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep === 0) {
      if (!formData.sport) {
        setError('Please select a primary sport');
        return;
      }
      if (!formData.experienceYears || isNaN(Number(formData.experienceYears))) {
        setError('Please enter a valid number for experience years');
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
    if (!formData.trainingPhilosophy.trim()) {
      setError('Please tell us about your training philosophy');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await createMentorProfile({
        user_id: user.id,
        expertise: [formData.sport],
        experience_years: parseInt(formData.experienceYears) || 0,
        bio: formData.bio,
        languages: formData.languages.split(',').map(s => s.trim()),
        availability: formData.availability.split(',').map(s => s.trim()),
        training_philosophy: formData.trainingPhilosophy,
        district: formData.district || 'New Delhi',
        state: formData.state || 'Delhi',
        verified: false,
        code_of_conduct_accepted: true,
      });

      localStorage.removeItem(`mentor_onboarding_draft_${user.id}`);
      await refreshProfile();
      queryClient.invalidateQueries({ queryKey: ['mentorProfile', user.id] });
      toast.success('Onboarding complete! Your profile is pending verification.');
      navigate('/dashboard/mentor');
    } catch (err: any) {
      setError(err.message || 'Failed to submit onboarding profile.');
    } finally {
      setLoading(false);
    }
  };

  const StepIcon = steps[currentStep].icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-amber-50 flex flex-col">
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
                <span>{step.title}</span>
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
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Step 1: Expertise & Sport */}
              {currentStep === 0 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Primary Sport Expertise *</Label>
                    <select
                      value={formData.sport}
                      onChange={(e) => updateForm('sport', e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <option value="">Select sport</option>
                      {SPORTS_LIST.map((sport) => (
                        <option key={sport} value={sport}>
                          {sport}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="experienceYears">Years of Experience *</Label>
                    <Input
                      id="experienceYears"
                      type="number"
                      placeholder="e.g. 5"
                      value={formData.experienceYears}
                      onChange={(e) => updateForm('experienceYears', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Professional Bio</Label>
                    <Textarea
                      id="bio"
                      placeholder="Introduce yourself, your training history, accomplishments, and coaching focus..."
                      value={formData.bio}
                      onChange={(e) => updateForm('bio', e.target.value)}
                      rows={4}
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Methodology & Logistics */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="trainingPhilosophy">Training Philosophy *</Label>
                    <Textarea
                      id="trainingPhilosophy"
                      placeholder="e.g. Focus on mental toughness, consistent skill training, and positive athlete empowerment..."
                      value={formData.trainingPhilosophy}
                      onChange={(e) => updateForm('trainingPhilosophy', e.target.value)}
                      rows={4}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <select
                        id="state"
                        value={formData.state}
                        onChange={(e) => updateForm('state', e.target.value)}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        <option value="">Select State</option>
                        {INDIAN_STATES.map((state) => (
                          <option key={state} value={state}>
                            {state}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="district">District</Label>
                      <Input
                        id="district"
                        placeholder="Enter district"
                        value={formData.district}
                        onChange={(e) => updateForm('district', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="languages">Languages spoken (comma-separated)</Label>
                      <Input
                        id="languages"
                        placeholder="English, Hindi"
                        value={formData.languages}
                        onChange={(e) => updateForm('languages', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="availability">Availability (comma-separated)</Label>
                      <Input
                        id="availability"
                        placeholder="Weekend, Evening"
                        value={formData.availability}
                        onChange={(e) => updateForm('availability', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation buttons */}
              <div className="flex justify-between pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  disabled={currentStep === 0 || loading}
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>

                {currentStep < steps.length - 1 ? (
                  <Button type="button" onClick={handleNext} className="bg-teal-600 hover:bg-teal-700 text-white">
                    Next
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading}
                    className="bg-teal-600 hover:bg-teal-700 text-white"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        Complete Profile
                        <Award className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

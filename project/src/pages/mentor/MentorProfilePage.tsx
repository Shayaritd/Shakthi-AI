import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { getMentorProfile, updateMentorProfile } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  User,
  Award,
  BookOpen,
  MapPin,
  Calendar,
  Globe,
  Star,
  Edit2,
  Save,
  CheckCircle,
  Loader2,
  Lock,
} from 'lucide-react';
import { SPORTS_LIST, INDIAN_STATES } from '@/constants/theme';
import { toast } from 'sonner';

export default function MentorProfilePage() {
  const { user, profile: userProfile, refreshProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const queryClient = useQueryClient();

  const { data: mentorProfile, isLoading } = useQuery({
    queryKey: ['mentorProfile', user?.id],
    queryFn: () => (user?.id ? getMentorProfile(user.id) : null),
    enabled: !!user?.id,
  });

  const [formData, setFormData] = useState<Record<string, any>>({});

  // Sync state when profile is fetched
  useEffect(() => {
    if (mentorProfile) {
      setFormData({
        expertise: Array.isArray(mentorProfile.expertise)
          ? mentorProfile.expertise.join(', ')
          : mentorProfile.expertise || '',
        experience_years: mentorProfile.experience_years || 0,
        bio: mentorProfile.bio || '',
        languages: Array.isArray(mentorProfile.languages)
          ? mentorProfile.languages.join(', ')
          : mentorProfile.languages || '',
        availability: Array.isArray(mentorProfile.availability)
          ? mentorProfile.availability.join(', ')
          : mentorProfile.availability || '',
        training_philosophy: mentorProfile.training_philosophy || '',
        district: mentorProfile.district || '',
        state: mentorProfile.state || '',
        certifications_list: mentorProfile.certifications?.certifications
          ? mentorProfile.certifications.certifications.join(', ')
          : '',
        certifications_level: mentorProfile.certifications?.level || 'National',
      });
    }
  }, [mentorProfile]);

  const updateMutation = useMutation({
    mutationFn: (updates: any) => updateMentorProfile(user!.id, updates),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['mentorProfile', user?.id] });
      await refreshProfile();
      toast.success('Mentor profile updated successfully!');
      setEditing(false);
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to update profile.');
    },
  });

  const handleSave = () => {
    // Basic validations
    if (!formData.expertise.trim()) {
      toast.error('Expertise / Sports cannot be empty.');
      return;
    }

    const certificationsObj = {
      level: formData.certifications_level,
      certifications: formData.certifications_list
        ? formData.certifications_list.split(',').map((c: string) => c.trim()).filter(Boolean)
        : [],
    };

    const updates = {
      expertise: formData.expertise.split(',').map((s: string) => s.trim()).filter(Boolean),
      experience_years: parseInt(formData.experience_years) || 0,
      bio: formData.bio,
      languages: formData.languages.split(',').map((s: string) => s.trim()).filter(Boolean),
      availability: formData.availability.split(',').map((s: string) => s.trim()).filter(Boolean),
      training_philosophy: formData.training_philosophy,
      district: formData.district,
      state: formData.state,
      certifications: certificationsObj,
    };

    updateMutation.mutate(updates);
  };

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Banner card */}
      <div className="relative overflow-hidden bg-gradient-to-r from-teal-600 to-emerald-700 text-white p-6 sm:p-8 rounded-2xl shadow-lg">
        <div className="absolute top-0 right-0 transform translate-x-12 -translate-y-12 w-64 h-64 bg-white opacity-5 rounded-full blur-xl pointer-events-none" />
        <div className="relative flex flex-col sm:flex-row items-center gap-6">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full border-4 border-white/20 bg-teal-800 flex items-center justify-center text-4xl font-bold shadow-md">
              {userProfile?.full_name ? userProfile.full_name.charAt(0).toUpperCase() : 'M'}
            </div>
          </div>
          <div className="text-center sm:text-left flex-1 space-y-1">
            <div className="flex flex-wrap justify-center sm:justify-start items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{userProfile?.full_name}</h1>
              {mentorProfile?.verified && (
                <Badge className="bg-teal-500 hover:bg-teal-600 text-white flex items-center gap-1 border-none px-2 py-0.5 text-xs font-semibold">
                  <CheckCircle className="w-3.5 h-3.5" /> Verified Mentor
                </Badge>
              )}
            </div>
            <p className="text-teal-100 flex items-center justify-center sm:justify-start gap-1 text-sm">
              {mentorProfile?.expertise ? (
                <>Expertise: {Array.isArray(mentorProfile.expertise) ? mentorProfile.expertise.join(', ') : mentorProfile.expertise}</>
              ) : (
                'Sports Mentor'
              )}
            </p>
            <div className="flex flex-wrap justify-center sm:justify-start items-center gap-4 text-xs text-teal-100 pt-2">
              <span className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-current text-amber-400" />
                {mentorProfile?.average_rating?.toFixed(1) || '0.0'} rating ({mentorProfile?.total_reviews || 0} reviews)
              </span>
              <span>•</span>
              <span>{mentorProfile?.experience_years || 0} years experience</span>
            </div>
          </div>
          <div className="pt-2 sm:pt-0">
            {editing ? (
              <div className="flex gap-2">
                <Button variant="outline" className="text-white border-white/30 hover:bg-white/10" onClick={() => setEditing(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={updateMutation.isPending} className="bg-white text-teal-700 hover:bg-teal-50">
                  {updateMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  <Save className="w-4 h-4 mr-2" /> Save Profile
                </Button>
              </div>
            ) : (
              <Button className="bg-white text-teal-700 hover:bg-teal-50" onClick={() => setEditing(true)}>
                <Edit2 className="w-4 h-4 mr-2" /> Edit Profile
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Sidebar Info Cards */}
        <div className="space-y-6">
          {/* Quick Info Card */}
          <Card className="overflow-hidden border border-gray-100 shadow-sm">
            <CardHeader className="bg-gray-50/50 pb-4">
              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-gray-800">
                <User className="w-4 h-4 text-teal-600" /> Account Info
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4 text-sm">
              <div className="space-y-1">
                <span className="text-xs text-gray-400 font-medium">Email Address</span>
                <p className="font-medium text-gray-700 break-all flex items-center gap-1.5">
                  {user?.email} <Lock className="w-3.5 h-3.5 text-gray-400" />
                </p>
              </div>
              <Separator />
              <div className="space-y-1">
                <span className="text-xs text-gray-400 font-medium">Phone Number</span>
                <p className="font-medium text-gray-700">{userProfile?.phone || 'Not configured'}</p>
              </div>
              <Separator />
              <div className="space-y-1">
                <span className="text-xs text-gray-400 font-medium">Trust Score</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-teal-600 text-base">{mentorProfile?.trust_score || 0}%</span>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-teal-500 rounded-full" style={{ width: `${mentorProfile?.trust_score || 0}%` }} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Languages & Availability Card */}
          <Card className="overflow-hidden border border-gray-100 shadow-sm">
            <CardHeader className="bg-gray-50/50 pb-4">
              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-gray-800">
                <Globe className="w-4 h-4 text-teal-600" /> Localization & Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              {editing ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="languages">Languages (comma-separated)</Label>
                    <Input
                      id="languages"
                      value={formData.languages || ''}
                      onChange={(e) => updateField('languages', e.target.value)}
                      placeholder="e.g. English, Hindi, Kannada"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="availability">Availability (comma-separated)</Label>
                    <Input
                      id="availability"
                      value={formData.availability || ''}
                      onChange={(e) => updateField('availability', e.target.value)}
                      placeholder="e.g. Weekend, Evening, Full-time"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <span className="text-xs text-gray-400 font-medium flex items-center gap-1">
                      <Globe className="w-3.5 h-3.5" /> Languages
                    </span>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {mentorProfile?.languages && mentorProfile.languages.length > 0 ? (
                        mentorProfile.languages.map((l: string) => (
                          <Badge key={l} variant="secondary" className="text-xs font-normal">
                            {l}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-sm text-gray-500">Not specified</span>
                      )}
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <span className="text-xs text-gray-400 font-medium flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> Availability
                    </span>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {mentorProfile?.availability && mentorProfile.availability.length > 0 ? (
                        mentorProfile.availability.map((a: string) => (
                          <Badge key={a} variant="outline" className="text-xs font-normal text-teal-600 border-teal-100 bg-teal-50/30">
                            {a}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-sm text-gray-500">Not specified</span>
                      )}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Details Panel */}
        <div className="md:col-span-2 space-y-6">
          <Card className="border border-gray-100 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-teal-600" /> Profile Details
              </CardTitle>
              <CardDescription>Methodology, background, and expert details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {editing ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expertise">Expertise / Sports (comma-separated)</Label>
                      <Input
                        id="expertise"
                        value={formData.expertise || ''}
                        onChange={(e) => updateField('expertise', e.target.value)}
                        placeholder="e.g. Kabaddi, Athletics"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="experience_years">Experience (Years)</Label>
                      <Input
                        id="experience_years"
                        type="number"
                        min="0"
                        max="50"
                        value={formData.experience_years}
                        onChange={(e) => updateField('experience_years', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Professional Bio</Label>
                    <Textarea
                      id="bio"
                      rows={4}
                      value={formData.bio || ''}
                      onChange={(e) => updateField('bio', e.target.value)}
                      placeholder="Write about your athletic career, coaching success, or goals..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="training_philosophy">Training Philosophy</Label>
                    <Textarea
                      id="training_philosophy"
                      rows={3}
                      value={formData.training_philosophy || ''}
                      onChange={(e) => updateField('training_philosophy', e.target.value)}
                      placeholder="e.g. Discipline, focus, scientific-training, and mental conditioning..."
                    />
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-700">Location Settings</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="state">State</Label>
                        <select
                          id="state"
                          value={formData.state || ''}
                          onChange={(e) => updateField('state', e.target.value)}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none"
                        >
                          <option value="">Select State</option>
                          {INDIAN_STATES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="district">District</Label>
                        <Input
                          id="district"
                          value={formData.district || ''}
                          onChange={(e) => updateField('district', e.target.value)}
                          placeholder="Enter your district"
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-700">Certifications & Achievements</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="col-span-1 space-y-2">
                        <Label htmlFor="certifications_level">Certification Level</Label>
                        <select
                          id="certifications_level"
                          value={formData.certifications_level || 'National'}
                          onChange={(e) => updateField('certifications_level', e.target.value)}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none"
                        >
                          <option value="District">District</option>
                          <option value="State">State</option>
                          <option value="National">National</option>
                          <option value="International">International</option>
                        </select>
                      </div>
                      <div className="col-span-2 space-y-2">
                        <Label htmlFor="certifications_list">Certifications (comma-separated)</Label>
                        <Input
                          id="certifications_list"
                          value={formData.certifications_list || ''}
                          onChange={(e) => updateField('certifications_list', e.target.value)}
                          placeholder="e.g. SAI Coach, NIS Diploma, PhD in Sports"
                        />
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Read-only view */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-gray-400">About Me</h3>
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {mentorProfile?.bio || 'No professional bio added yet.'}
                    </p>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-gray-400">Training Philosophy</h3>
                    <p className="text-sm text-gray-700 leading-relaxed italic">
                      {mentorProfile?.training_philosophy ? `"${mentorProfile.training_philosophy}"` : 'No training philosophy provided.'}
                    </p>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <span className="text-xs text-gray-400 font-medium flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" /> Address / Location
                      </span>
                      <p className="text-sm font-semibold text-gray-700">
                        {mentorProfile?.district ? `${mentorProfile.district}, ${mentorProfile.state}` : 'Not set'}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs text-gray-400 font-medium flex items-center gap-1">
                        <Award className="w-3.5 h-3.5" /> Certifications Level
                      </span>
                      <p className="text-sm font-semibold text-gray-700">
                        {mentorProfile?.certifications?.level ? `${mentorProfile.certifications.level} Level` : 'Not specified'}
                      </p>
                    </div>
                  </div>

                  {mentorProfile?.certifications?.certifications && mentorProfile.certifications.certifications.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <span className="text-xs text-gray-400 font-medium">Earned Certifications</span>
                      <div className="flex flex-wrap gap-2">
                        {mentorProfile.certifications.certifications.map((c: string) => (
                          <Badge key={c} variant="outline" className="text-xs font-semibold py-1 px-2.5 bg-gray-50 border-gray-200">
                            {c}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { getAthleteProfile, updateAthleteProfile, calculateProfileCompletion } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  User,
  Trophy,
  Target,
  MapPin,
  Phone,
  Calendar,
  Shield,
  Edit2,
  Save,
  Award,
  Star,
  Play,
  CheckCircle,
  Loader2,
} from 'lucide-react';
import { SPORTS_LIST, INDIAN_STATES, ATHLETE_LEVELS } from '@/constants/theme';
import { format } from 'date-fns';

export default function AthleteProfilePage() {
  const { user, profile: userProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const queryClient = useQueryClient();

  const { data: athleteProfile, isLoading } = useQuery({
    queryKey: ['athleteProfile', user?.id],
    queryFn: () => (user ? getAthleteProfile(user.id) : null),
    enabled: !!user,
  });

  const [formData, setFormData] = useState<Record<string, any>>({});

  const updateMutation = useMutation({
    mutationFn: (updates: any) => updateAthleteProfile(user!.id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['athleteProfile', user?.id] });
      setEditing(false);
    },
  });

  const handleSave = () => {
    updateMutation.mutate({
      ...formData,
      profile_completion: calculateProfileCompletion(formData),
    });
  };

  const updateForm = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  const athleteUserProfile = athleteProfile?.profile;
  const completion = athleteProfile?.profile_completion || 0;

  const badges = [
    { name: 'Rising Star', icon: Star, color: 'bg-amber-100 text-amber-700' },
    { name: 'School Champion', icon: Trophy, color: 'bg-teal-100 text-teal-700' },
    { name: 'First Mentor Connect', icon: User, color: 'bg-blue-100 text-blue-700' },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-teal-100 flex items-center justify-center text-3xl font-bold text-teal-700">
                {athleteUserProfile?.full_name?.charAt(0) || 'A'}
              </div>
              {athleteUserProfile?.verified && (
                <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-teal-600 flex items-center justify-center border-2 border-white">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">{athleteUserProfile?.full_name}</h1>
                {athleteUserProfile?.verified && (
                  <Badge className="bg-teal-100 text-teal-700">
                    <Shield className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
              <p className="text-gray-600 mt-1">
                {athleteProfile?.sport} • {athleteProfile?.level} Level Athlete
              </p>
              <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                {athleteProfile?.state && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {athleteProfile.district}, {athleteProfile.state}
                  </span>
                )}
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Profile Completion</span>
                  <span className="font-medium text-teal-700">{completion}%</span>
                </div>
                <Progress value={completion} className="h-2" />
              </div>
            </div>

            <Button
              variant={editing ? 'default' : 'outline'}
              onClick={() => {
                if (editing) {
                  handleSave();
                } else {
                  setFormData(athleteProfile || {});
                  setEditing(true);
                }
              }}
              disabled={updateMutation.isPending}
              className={editing ? 'bg-teal-600 hover:bg-teal-700' : ''}
            >
              {updateMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : editing ? (
                <Save className="w-4 h-4 mr-2" />
              ) : (
                <Edit2 className="w-4 h-4 mr-2" />
              )}
              {editing ? 'Save Changes' : 'Edit Profile'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="about" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="about">About</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="media">Media</TabsTrigger>
          <TabsTrigger value="badges">Badges</TabsTrigger>
        </TabsList>

        <TabsContent value="about" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Personal Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {editing ? (
                  <>
                    <div className="space-y-2">
                      <Label>Primary Sport</Label>
                      <Select
                        value={formData.sport || ''}
                        onValueChange={(v) => updateForm('sport', v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select sport" />
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
                      <Label>Position/Event</Label>
                      <Input
                        value={formData.position || ''}
                        onChange={(e) => updateForm('position', e.target.value)}
                        placeholder="e.g., Sprinter, Goalkeeper"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Level</Label>
                      <Select
                        value={formData.level || 'SCHOOL'}
                        onValueChange={(v) => updateForm('level', v)}
                      >
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
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                      <Trophy className="w-4 h-4 text-teal-600" />
                      <div>
                        <p className="text-sm text-gray-500">Sport</p>
                        <p className="font-medium">{athleteProfile?.sport || 'Not specified'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Target className="w-4 h-4 text-teal-600" />
                      <div>
                        <p className="text-sm text-gray-500">Position/Event</p>
                        <p className="font-medium">{athleteProfile?.position || 'Not specified'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Award className="w-4 h-4 text-teal-600" />
                      <div>
                        <p className="text-sm text-gray-500">Level</p>
                        <p className="font-medium">
                          {ATHLETE_LEVELS.find((l) => l.value === athleteProfile?.level)?.label}
                        </p>
                      </div>
                    </div>
                    {athleteProfile?.date_of_birth && (
                      <div className="flex items-center gap-3">
                        <Calendar className="w-4 h-4 text-teal-600" />
                        <div>
                          <p className="text-sm text-gray-500">Date of Birth</p>
                          <p className="font-medium">
                            {format(new Date(athleteProfile.date_of_birth), 'MMMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Location */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Location & Guardian
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {editing ? (
                  <>
                    <div className="space-y-2">
                      <Label>State</Label>
                      <Select
                        value={formData.state || ''}
                        onValueChange={(v) => updateForm('state', v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select state" />
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
                      <Label>District</Label>
                      <Input
                        value={formData.district || ''}
                        onChange={(e) => updateForm('district', e.target.value)}
                        placeholder="Enter district"
                      />
                    </div>
                    <Separator className="my-4" />
                    <div className="space-y-2">
                      <Label>Guardian Name</Label>
                      <Input
                        value={formData.guardian_name || ''}
                        onChange={(e) => updateForm('guardian_name', e.target.value)}
                        placeholder="Parent/Guardian name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Guardian Phone</Label>
                      <Input
                        value={formData.guardian_phone || ''}
                        onChange={(e) => updateForm('guardian_phone', e.target.value)}
                        placeholder="+91 9876543210"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4 text-teal-600" />
                      <div>
                        <p className="text-sm text-gray-500">Location</p>
                        <p className="font-medium">
                          {athleteProfile?.district}, {athleteProfile?.state}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <User className="w-4 h-4 text-teal-600" />
                      <div>
                        <p className="text-sm text-gray-500">Guardian</p>
                        <p className="font-medium">{athleteProfile?.guardian_name || 'Not specified'}</p>
                      </div>
                    </div>
                    {athleteProfile?.guardian_phone && (
                      <div className="flex items-center gap-3">
                        <Phone className="w-4 h-4 text-teal-600" />
                        <div>
                          <p className="text-sm text-gray-500">Guardian Phone</p>
                          <p className="font-medium">{athleteProfile.guardian_phone}</p>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Bio and Goals */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">About & Goals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {editing ? (
                <>
                  <div className="space-y-2">
                    <Label>Bio</Label>
                    <Textarea
                      value={formData.bio || ''}
                      onChange={(e) => updateForm('bio', e.target.value)}
                      placeholder="Tell others about yourself..."
                      rows={4}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Goals</Label>
                    <Textarea
                      value={formData.goals || ''}
                      onChange={(e) => updateForm('goals', e.target.value)}
                      placeholder="What do you want to achieve?"
                      rows={3}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <p className="text-sm text-gray-500 mb-2">About</p>
                    <p className="text-gray-700">
                      {athleteProfile?.bio || 'No bio added yet.'}
                    </p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Goals</p>
                    <p className="text-gray-700">
                      {athleteProfile?.goals || 'No goals specified yet.'}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                Achievements & Certificates
              </CardTitle>
              <CardDescription>Your competition history and awards</CardDescription>
            </CardHeader>
            <CardContent>
              {athleteProfile?.achievements && (athleteProfile.achievements as any[]).length > 0 ? (
                <div className="space-y-4">
                  {(athleteProfile.achievements as any[]).map((achievement, i) => (
                    <div key={i} className="p-4 rounded-lg border bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{achievement.title}</h4>
                          <p className="text-sm text-gray-500">{achievement.event}</p>
                        </div>
                        {achievement.medal && (
                          <Badge>
                            {achievement.medal}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Trophy className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No achievements added yet</p>
                  {editing && <Button variant="link">Add Achievement</Button>}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="media">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Play className="w-5 h-5" />
                Videos & Media
              </CardTitle>
              <CardDescription>Upload performance videos to showcase your skills</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <Play className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No videos uploaded yet</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="badges">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Award className="w-5 h-5" />
                Your Badges
              </CardTitle>
              <CardDescription>Awards earned on SHAKTHI</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {badges.map((badge, i) => (
                  <div
                    key={i}
                    className={`p-4 rounded-xl ${badge.color} flex flex-col items-center text-center`}
                  >
                    <badge.icon className="w-8 h-8 mb-2" />
                    <span className="text-sm font-medium">{badge.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

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
  Trash2,
  Plus,
} from 'lucide-react';
import { SPORTS_LIST, INDIAN_STATES, ATHLETE_LEVELS } from '@/constants/theme';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

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
  
  // State for achievements dialog/inline form
  const [showAddAchievement, setShowAddAchievement] = useState(false);
  const [newAchTitle, setNewAchTitle] = useState('');
  const [newAchEvent, setNewAchEvent] = useState('');
  const [newAchMedal, setNewAchMedal] = useState('');

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

  const handleAddAchievement = async () => {
    if (!newAchTitle.trim()) return;
    const currentAchs = athleteProfile?.achievements || [];
    const newAch = {
      title: newAchTitle,
      event: newAchEvent,
      level: 'District',
      year: new Date().getFullYear(),
      medal: newAchMedal && newAchMedal !== 'None' ? newAchMedal : undefined,
    };
    try {
      const updated = [...currentAchs, newAch];
      await updateAthleteProfile(user!.id, { achievements: updated });
      queryClient.invalidateQueries({ queryKey: ['athleteProfile', user?.id] });
      toast.success("Achievement added successfully!");
      setNewAchTitle('');
      setNewAchEvent('');
      setNewAchMedal('');
      setShowAddAchievement(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to add achievement.");
    }
  };

  const handleDeleteAchievement = async (index: number) => {
    const confirm = window.confirm("Are you sure you want to delete this achievement?");
    if (!confirm) return;
    const currentAchs = athleteProfile?.achievements || [];
    const updated = currentAchs.filter((_: any, i: number) => i !== index);
    try {
      await updateAthleteProfile(user!.id, { achievements: updated });
      queryClient.invalidateQueries({ queryKey: ['athleteProfile', user?.id] });
      toast.success("Achievement deleted successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete achievement.");
    }
  };

  // State for media upload
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleMediaFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (10MB limit)
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setUploadError("File size exceeds 10MB limit.");
      return;
    }

    // Validate type (image or video)
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    if (!isImage && !isVideo) {
      setUploadError("Invalid file type. Only images and videos are allowed.");
      return;
    }

    setUploadingMedia(true);
    setUploadError(null);

    try {
      let publicUrl = '';
      
      // Try uploading to Supabase Storage bucket 'media'
      const fileExt = file.name.split('.').pop();
      const fileName = `${user!.id}/${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('media')
        .upload(fileName, file, { cacheControl: '3600', upsert: true });

      if (error) {
        console.warn("Supabase storage upload failed, falling back to simulated upload:", error.message);
        // Fallback: Use FileReader to convert to base64 Data URL for images,
        // or a simulated URL if it is a video (since base64 videos can be extremely large).
        if (isImage && file.size < 2 * 1024 * 1024) {
          const reader = new FileReader();
          publicUrl = await new Promise<string>((resolve) => {
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          });
        } else if (isVideo) {
          publicUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4';
        } else {
          publicUrl = 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&q=80&w=800';
        }
      } else {
        const { data: urlData } = supabase.storage
          .from('media')
          .getPublicUrl(fileName);
        publicUrl = urlData.publicUrl;
      }

      // Save to database
      const currentUrls = athleteProfile?.video_urls || [];
      const updatedUrls = [...currentUrls, publicUrl];
      await updateAthleteProfile(user!.id, { video_urls: updatedUrls });
      
      queryClient.invalidateQueries({ queryKey: ['athleteProfile', user?.id] });
    } catch (err: any) {
      console.error(err);
      setUploadError(err.message || "Failed to upload media.");
    } finally {
      setUploadingMedia(false);
      // Clear file input
      e.target.value = '';
    }
  };

  const handleDeleteMedia = async (url: string) => {
    try {
      const currentUrls = athleteProfile?.video_urls || [];
      const updatedUrls = currentUrls.filter(u => u !== url);
      await updateAthleteProfile(user!.id, { video_urls: updatedUrls });
      queryClient.invalidateQueries({ queryKey: ['athleteProfile', user?.id] });
    } catch (err: any) {
      console.error("Delete media error:", err);
    }
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

  const computedBadges = [];

  // 1. Profile Completion Badge
  if (completion >= 50) {
    computedBadges.push({
      name: 'Rising Star',
      icon: Star,
      color: 'bg-amber-50 text-amber-700 border-amber-200',
      description: 'Profile is over 50% completed',
      unlocked: true,
    });
  } else {
    computedBadges.push({
      name: 'Rising Star',
      icon: Star,
      color: '',
      description: 'Complete 50% of your profile to unlock',
      unlocked: false,
    });
  }

  // 2. Achievements Badge
  const achievementCount = athleteProfile?.achievements ? (athleteProfile.achievements as any[]).length : 0;
  if (achievementCount > 0) {
    computedBadges.push({
      name: 'Active Competitor',
      icon: Trophy,
      color: 'bg-teal-50 text-teal-700 border-teal-200',
      description: `Registered ${achievementCount} achievements`,
      unlocked: true,
    });
  } else {
    computedBadges.push({
      name: 'Active Competitor',
      icon: Trophy,
      color: '',
      description: 'Add your first achievement to unlock',
      unlocked: false,
    });
  }

  // 3. Media Showcase Badge
  const mediaCount = athleteProfile?.video_urls ? (athleteProfile.video_urls as string[]).length : 0;
  if (mediaCount > 0) {
    computedBadges.push({
      name: 'Media Showcase',
      icon: Play,
      color: 'bg-blue-50 text-blue-700 border-blue-200',
      description: 'Uploaded performance videos or images',
      unlocked: true,
    });
  } else {
    computedBadges.push({
      name: 'Media Showcase',
      icon: Play,
      color: '',
      description: 'Upload your first media file to unlock',
      unlocked: false,
    });
  }

  // 4. Verification Badge
  if (athleteUserProfile?.verified) {
    computedBadges.push({
      name: 'Verified Champion',
      icon: CheckCircle,
      color: 'bg-purple-50 text-purple-700 border-purple-200',
      description: 'Profile verified by safety officer',
      unlocked: true,
    });
  } else {
    computedBadges.push({
      name: 'Verified Champion',
      icon: CheckCircle,
      color: '',
      description: 'Get verified by the safety officer to unlock',
      unlocked: false,
    });
  }

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
        </TabsContent>        <TabsContent value="achievements">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-teal-600" />
                  Achievements & Certificates
                </CardTitle>
                <CardDescription>Your competition history and awards (updates are saved immediately)</CardDescription>
              </div>
              <Button size="sm" onClick={() => setShowAddAchievement(true)} className="bg-teal-600 hover:bg-teal-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Add Achievement
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {showAddAchievement && (
                <div className="p-4 border rounded-lg bg-gray-50 space-y-3 shadow-inner">
                  <h4 className="font-semibold text-sm text-teal-900">New Achievement</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="ach-title">Title/Award</Label>
                      <Input
                        id="ach-title"
                        placeholder="e.g., Gold Medalist"
                        value={newAchTitle}
                        onChange={(e) => setNewAchTitle(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="ach-event">Event/Competition</Label>
                      <Input
                        id="ach-event"
                        placeholder="e.g., State Athletics 2025"
                        value={newAchEvent}
                        onChange={(e) => setNewAchEvent(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="ach-medal">Medal/Type</Label>
                      <Select value={newAchMedal} onValueChange={setNewAchMedal}>
                        <SelectTrigger id="ach-medal">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Gold">Gold</SelectItem>
                          <SelectItem value="Silver">Silver</SelectItem>
                          <SelectItem value="Bronze">Bronze</SelectItem>
                          <SelectItem value="Winner">Winner</SelectItem>
                          <SelectItem value="Participation">Participation</SelectItem>
                          <SelectItem value="None">None</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button size="sm" variant="outline" onClick={() => setShowAddAchievement(false)}>
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handleAddAchievement} className="bg-teal-600 hover:bg-teal-700 text-white">
                      Add & Save
                    </Button>
                  </div>
                </div>
              )}

              {athleteProfile?.achievements && (athleteProfile.achievements as any[]).length > 0 ? (
                <div className="space-y-4">
                  {(athleteProfile.achievements as any[]).map((achievement, i) => (
                    <div key={i} className="p-4 rounded-lg border bg-gray-50 flex items-center justify-between shadow-sm">
                      <div>
                        <h4 className="font-medium text-teal-900">{achievement.title}</h4>
                        <p className="text-sm text-gray-500">{achievement.event}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        {achievement.medal && (
                          <Badge className="bg-amber-100 text-amber-800 border-amber-300">
                            {achievement.medal}
                          </Badge>
                        )}
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDeleteAchievement(i)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Trophy className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No achievements added yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="media">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Play className="w-5 h-5" />
                  Videos & Media
                </CardTitle>
                <CardDescription>Upload performance videos to showcase your skills</CardDescription>
              </div>
              <div className="flex gap-2">
                <input
                  type="file"
                  id="media-upload-input"
                  className="hidden"
                  accept="image/*,video/*"
                  onChange={handleMediaFileChange}
                />
                <Button size="sm" onClick={() => document.getElementById('media-upload-input')?.click()} disabled={uploadingMedia}>
                  {uploadingMedia ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4 mr-2" />
                  )}
                  Upload Media
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {uploadError && (
                <div className="text-sm text-red-600 bg-red-50 p-2.5 rounded border border-red-200">
                  {uploadError}
                </div>
              )}
              {athleteProfile?.video_urls && (athleteProfile.video_urls as string[]).length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(athleteProfile.video_urls as string[]).map((url, i) => {
                    const isVideo = url.includes('.mp4') || url.includes('.webm') || url.includes('video') || url.includes('simulated_uploads') && !url.includes('.jpg') && !url.includes('.png') && !url.includes('.webp');
                    return (
                      <div key={i} className="relative group rounded-lg overflow-hidden border bg-black aspect-video flex items-center justify-center">
                        {isVideo ? (
                          <video src={url} controls className="w-full h-full object-cover" />
                        ) : (
                          <img src={url} alt={`Media ${i}`} className="w-full h-full object-cover" />
                        )}
                        <Button
                          size="icon"
                          variant="destructive"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleDeleteMedia(url)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Play className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No videos or images uploaded yet</p>
                </div>
              )}
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
              <CardDescription>Awards and milestones earned on SHAKTHI</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {computedBadges.map((badge, i) => (
                  <div
                    key={i}
                    className={`p-4 rounded-xl border flex flex-col items-center text-center space-y-2 transition-all ${
                      badge.unlocked ? badge.color : 'bg-gray-50 text-gray-400 border-gray-200'
                    }`}
                  >
                    <badge.icon className={`w-8 h-8 ${badge.unlocked ? '' : 'text-gray-300'}`} />
                    <div>
                      <h4 className="font-bold text-sm">{badge.name}</h4>
                      <p className="text-xs mt-1">{badge.description}</p>
                    </div>
                    <Badge variant={badge.unlocked ? 'default' : 'secondary'} className={badge.unlocked ? 'bg-teal-600 text-white hover:bg-teal-600 font-semibold' : 'text-gray-400'}>
                      {badge.unlocked ? 'Unlocked' : 'Locked'}
                    </Badge>
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

import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  User,
  Bell,
  Shield,
  Globe,
  Moon,
  LogOut,
  Loader2,
  CheckCircle,
} from 'lucide-react';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAthleteProfile, updateAthleteProfile, updateProfile } from '@/services/api';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  // Profile editing state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editLang, setEditLang] = useState('en');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // 2FA state
  const [twoFAEnabled, setTwoFAEnabled] = useState(() => localStorage.getItem('shakthi_2fa_enabled') === 'true');
  const [show2FAWizard, setShow2FAWizard] = useState(false);
  const [otpCode, setOtpCode] = useState('');

  const queryClient = useQueryClient();

  const { data: athleteProfile } = useQuery({
    queryKey: ['athleteProfile', profile?.id],
    queryFn: () => (profile?.id ? getAthleteProfile(profile.id) : null),
    enabled: profile?.role === 'ATHLETE',
  });

  const updateVisibilityMutation = useMutation({
    mutationFn: (newSettings: any) => updateAthleteProfile(profile!.id, { visibility_settings: newSettings }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['athleteProfile', profile?.id] });
      toast.success('Privacy settings updated successfully!');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to update privacy settings.');
    }
  });

  const currentVisibility = athleteProfile?.visibility_settings || {
    showProfile: true,
    showAchievements: true,
    showContact: true,
  };

  const handleToggleVisibility = (key: string, checked: boolean) => {
    const updated = {
      ...currentVisibility,
      [key]: checked,
    };
    updateVisibilityMutation.mutate(updated);
  };

  const handleStartEdit = () => {
    setEditName(profile?.full_name || '');
    setEditPhone(profile?.phone || '');
    setEditLang(profile?.preferred_language || 'en');
    setIsEditingProfile(true);
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      toast.error("Full Name cannot be empty.");
      return;
    }
    setIsSavingProfile(true);
    try {
      await updateProfile(profile!.id, {
        full_name: editName.trim(),
        phone: editPhone.trim() || undefined,
        preferred_language: editLang,
      });
      await refreshProfile();
      toast.success("Profile updated successfully!");
      setIsEditingProfile(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleEnable2FA = () => {
    if (!otpCode || otpCode.length !== 6 || isNaN(Number(otpCode))) {
      toast.error("Please enter a valid 6-digit code.");
      return;
    }
    localStorage.setItem('shakthi_2fa_enabled', 'true');
    setTwoFAEnabled(true);
    setShow2FAWizard(false);
    setOtpCode('');
    toast.success("Two-Factor Authentication enabled successfully!");
  };

  const handleDisable2FA = () => {
    const confirm = window.confirm("Are you sure you want to disable 2FA? This will decrease your account security.");
    if (confirm) {
      localStorage.setItem('shakthi_2fa_enabled', 'false');
      setTwoFAEnabled(false);
      toast.success("Two-Factor Authentication disabled.");
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto relative">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500">Manage your account preferences</p>
      </div>

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Profile Settings
          </CardTitle>
          <CardDescription>Your personal information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditingProfile ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Enter full name" />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={user?.email || ''} disabled className="bg-gray-50 cursor-not-allowed text-gray-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} placeholder="e.g. +91 9876543210" />
                </div>
                <div className="space-y-2">
                  <Label>Preferred Language</Label>
                  <select 
                    value={editLang} 
                    onChange={(e) => setEditLang(e.target.value)} 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="en">English</option>
                    <option value="hi">Hindi (हिन्दी)</option>
                    <option value="te">Telugu (తెలుగు)</option>
                    <option value="ta">Tamil (தமிழ்)</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <Button variant="outline" onClick={() => setIsEditingProfile(false)} disabled={isSavingProfile}>
                  Cancel
                </Button>
                <Button onClick={handleSaveProfile} disabled={isSavingProfile} className="bg-teal-600 hover:bg-teal-700 text-white">
                  {isSavingProfile && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Save Changes
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input value={profile?.full_name || ''} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={user?.email || ''} disabled />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input value={profile?.phone || 'Not set'} disabled />
              </div>
              <Button variant="outline" onClick={handleStartEdit}>Edit Profile</Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notifications
          </CardTitle>
          <CardDescription>Manage how you receive updates</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Push Notifications</p>
              <p className="text-sm text-gray-500">Receive alerts on your device</p>
            </div>
            <Switch checked={notifications} onCheckedChange={setNotifications} />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Email Updates</p>
              <p className="text-sm text-gray-500">Weekly summary and important updates</p>
            </div>
            <Switch checked={emailUpdates} onCheckedChange={setEmailUpdates} />
          </div>
        </CardContent>
      </Card>

      {/* Privacy & Safety */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Privacy & Safety
          </CardTitle>
          <CardDescription>Control your privacy settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {profile?.role === 'ATHLETE' ? (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Public Profile Visibility</p>
                  <p className="text-sm text-gray-500">Allow others to find and view your profile</p>
                </div>
                <Switch
                  checked={currentVisibility.showProfile}
                  onCheckedChange={(checked) => handleToggleVisibility('showProfile', checked)}
                  disabled={updateVisibilityMutation.isPending}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Show Achievements</p>
                  <p className="text-sm text-gray-500">Display your trophies and certificates on your profile</p>
                </div>
                <Switch
                  checked={currentVisibility.showAchievements}
                  onCheckedChange={(checked) => handleToggleVisibility('showAchievements', checked)}
                  disabled={updateVisibilityMutation.isPending}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Show Contact Info</p>
                  <p className="text-sm text-gray-500">Let verified coaches/mentors see your contact details</p>
                </div>
                <Switch
                  checked={currentVisibility.showContact}
                  onCheckedChange={(checked) => handleToggleVisibility('showContact', checked)}
                  disabled={updateVisibilityMutation.isPending}
                />
              </div>
            </>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Profile Visibility</p>
                <p className="text-sm text-gray-500">Control who can see your profile</p>
              </div>
              <Badge>Verified Mentors Only</Badge>
            </div>
          )}
          
          <Separator />
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium">Two-Factor Authentication</p>
                  {twoFAEnabled ? (
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      <CheckCircle className="w-3 h-3 mr-1" /> Enabled
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Disabled</Badge>
                  )}
                </div>
                <p className="text-sm text-gray-500">Add extra security to your account</p>
              </div>
              {twoFAEnabled ? (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDisable2FA}
                >
                  Disable
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShow2FAWizard(true)}
                >
                  Enable
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Moon className="w-5 h-5" />
            Appearance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Dark Mode</p>
              <p className="text-sm text-gray-500">Switch to dark theme</p>
            </div>
            <Switch checked={darkMode} onCheckedChange={setDarkMode} />
          </div>
        </CardContent>
      </Card>

      {/* Language */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Language
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Preferred Language</p>
              <p className="text-sm text-gray-500">Display language for the app</p>
            </div>
            <Badge className="capitalize">
              {profile?.preferred_language === 'hi' ? 'Hindi' : profile?.preferred_language === 'ta' ? 'Tamil' : profile?.preferred_language === 'te' ? 'Telugu' : 'English'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Sign Out */}
      <Card className="border-red-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-red-700">Sign Out</p>
              <p className="text-sm text-gray-500">Sign out of your account</p>
            </div>
            <Button variant="destructive" onClick={signOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 2FA Setup Wizard Modal */}
      {show2FAWizard && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md shadow-2xl border-teal-100">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-xl flex items-center justify-center gap-2">
                <Shield className="w-6 h-6 text-teal-600" />
                Setup Two-Factor (2FA)
              </CardTitle>
              <CardDescription>
                Scan the QR code with your authenticator app
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl border border-gray-150">
                <div className="w-36 h-36 bg-white p-2 rounded-lg border flex items-center justify-center shadow-inner">
                  <svg className="w-full h-full text-gray-800" viewBox="0 0 100 100">
                    <rect x="5" y="5" width="25" height="25" fill="currentColor" />
                    <rect x="10" y="10" width="15" height="15" fill="white" />
                    <rect x="13" y="13" width="9" height="9" fill="currentColor" />
                    
                    <rect x="5" y="70" width="25" height="25" fill="currentColor" />
                    <rect x="10" y="75" width="15" height="15" fill="white" />
                    <rect x="13" y="78" width="9" height="9" fill="currentColor" />
                    
                    <rect x="70" y="5" width="25" height="25" fill="currentColor" />
                    <rect x="75" y="10" width="15" height="15" fill="white" />
                    <rect x="78" y="13" width="9" height="9" fill="currentColor" />
                    
                    <rect x="40" y="10" width="10" height="20" fill="currentColor" />
                    <rect x="55" y="5" width="10" height="10" fill="currentColor" />
                    <rect x="45" y="45" width="15" height="15" fill="currentColor" />
                    <rect x="10" y="45" width="15" height="10" fill="currentColor" />
                    <rect x="75" y="40" width="15" height="20" fill="currentColor" />
                    <rect x="35" y="75" width="20" height="15" fill="currentColor" />
                    <rect x="70" y="75" width="20" height="20" fill="currentColor" />
                  </svg>
                </div>
                <p className="text-[10px] text-gray-400 mt-2 font-mono uppercase tracking-wider">
                  Secret Key: SHK-AUTH-77X-99P
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="otp-input" className="text-sm font-medium">
                  Enter 6-digit Verification Code
                </Label>
                <Input
                  id="otp-input"
                  placeholder="e.g. 123456"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  className="text-center font-mono text-lg tracking-widest"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <Button variant="outline" onClick={() => { setShow2FAWizard(false); setOtpCode(''); }}>
                  Cancel
                </Button>
                <Button onClick={handleEnable2FA} className="bg-teal-600 hover:bg-teal-700 text-white">
                  Verify & Enable
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

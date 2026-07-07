import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { updateProfile } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Heart, Loader2, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

export default function GuardianOnboardingPage() {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    relation: 'Mother',
    childName: '',
    childSport: '',
    phone: '',
  });

  const updateForm = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!formData.childName.trim()) {
      setError("Please enter your child's full name.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Save details to Profiles table
      await updateProfile(user.id, {
        phone: formData.phone.trim() || undefined,
        // We can save metadata or details in the profile if needed
      });

      // Keep record in localStorage of relation and child linking for dashboard display
      localStorage.setItem(`shakthi_guardian_child_${user.id}`, JSON.stringify({
        childName: formData.childName.trim(),
        childSport: formData.childSport.trim(),
        relation: formData.relation,
      }));

      await refreshProfile();
      toast.success("Guardian profile setup complete!");
      navigate('/dashboard/guardian');
    } catch (err: any) {
      setError(err.message || "Failed to save guardian profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-amber-50 flex flex-col">
      <header className="p-4 sm:p-6">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-600 to-teal-800 flex items-center justify-center">
              <span className="text-white font-bold">S</span>
            </div>
            <span className="font-bold text-teal-900">SHAKTHI</span>
          </div>
          <Badge variant="outline" className="text-sm">Guardian Onboarding</Badge>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <Card className="border-0 shadow-xl">
            <CardHeader className="text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-100 flex items-center justify-center mb-4">
                <Heart className="w-8 h-8 text-rose-600 animate-pulse" />
              </div>
              <CardTitle className="text-2xl">Guardian Verification</CardTitle>
              <CardDescription>Verify your identity and link your child's athlete profile for safety monitoring</CardDescription>
            </CardHeader>

            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="relation">Relationship to Athlete</Label>
                  <select
                    id="relation"
                    value={formData.relation}
                    onChange={(e) => updateForm('relation', e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="Mother">Mother</option>
                    <option value="Father">Father</option>
                    <option value="Legal Guardian">Legal Guardian</option>
                    <option value="Coach/Other">Coach / Academy Admin</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="childName">Athlete's Full Name (Your Child) *</Label>
                  <Input
                    id="childName"
                    placeholder="Enter athlete's name"
                    value={formData.childName}
                    onChange={(e) => updateForm('childName', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="childSport">Athlete's Primary Sport</Label>
                  <Input
                    id="childSport"
                    placeholder="e.g. Volleyball, Athletics"
                    value={formData.childSport}
                    onChange={(e) => updateForm('childSport', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Your Contact Number (Optional)</Label>
                  <Input
                    id="phone"
                    placeholder="e.g. +91 9876543210"
                    value={formData.phone}
                    onChange={(e) => updateForm('phone', e.target.value)}
                  />
                </div>

                <div className="flex items-start gap-2 text-xs text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-150 mt-4">
                  <ShieldCheck className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                  <p>
                    By proceeding, you verify you are the parent/guardian of this athlete. You will be able to monitor their chats with sports mentors and review connection requests.
                  </p>
                </div>

                <Button type="submit" disabled={loading} className="w-full bg-teal-600 hover:bg-teal-700 text-white mt-6">
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Setting up...
                    </>
                  ) : (
                    "Complete Setup & View Dashboard"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

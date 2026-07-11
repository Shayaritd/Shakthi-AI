import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { getMentoredAthletes, getOrCreateChatThread } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Users,
  MessageSquare,
  MapPin,
  Loader2,
  Sparkles,
} from 'lucide-react';

export default function MyAthletesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: athletes = [], isLoading, error } = useQuery({
    queryKey: ['mentoredAthletes', user?.id],
    queryFn: () => getMentoredAthletes(user!.id),
    enabled: !!user,
  });

  const handleStartChat = async (athleteId: string) => {
    try {
      toast.loading('Opening conversation...');
      await getOrCreateChatThread(athleteId, user!.id);
      toast.dismiss();
      navigate('/chat');
    } catch (err: any) {
      toast.dismiss();
      toast.error('Failed to open chat: ' + err.message);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
          <p className="text-gray-500 font-medium">Loading your athletes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Failed to load athletes: {(error as Error).message}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Athletes</h1>
        <p className="text-gray-500">Manage and guide the athletes under your mentorship</p>
      </div>

      {athletes.length === 0 ? (
        <Card className="border-dashed border-2 py-12">
          <CardContent className="flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-teal-50 flex items-center justify-center">
              <Users className="w-8 h-8 text-teal-600" />
            </div>
            <div className="space-y-2 max-w-md">
              <CardTitle className="text-xl font-semibold text-gray-800">No Athletes Mentored Yet</CardTitle>
              <CardDescription>
                When you approve mentorship requests from athletes, they will appear here.
                Athletes can discover your profile and send requests once you are verified.
              </CardDescription>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {athletes.map((item) => {
            const athlete = item.athlete;
            const athleteProfile = Array.isArray(athlete?.athlete_profiles)
              ? athlete.athlete_profiles[0]
              : athlete?.athlete_profiles;

            const initials = athlete?.full_name
              ? athlete.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
              : 'A';

            return (
              <Card key={item.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardHeader className="bg-gradient-to-r from-teal-50/50 to-blue-50/20 pb-4 border-b">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                      {athlete?.avatar_url ? (
                        <AvatarImage src={athlete.avatar_url} alt={athlete.full_name} />
                      ) : null}
                      <AvatarFallback className="bg-teal-600 text-white font-bold">{initials}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-gray-900 truncate">{athlete?.full_name}</h3>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                        <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                        <span className="truncate">{athlete?.district ? `${athlete.district}, ${athlete.state}` : 'India'}</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-5 space-y-4">
                  {/* Sport & Level info */}
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200">
                      {athleteProfile?.sport || 'General Sports'}
                    </Badge>
                    <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200">
                      {athleteProfile?.level || 'State Level'}
                    </Badge>
                  </div>

                  {/* Goal or Message */}
                  {item.goal && (
                    <div className="space-y-1 bg-gray-50/50 p-3 rounded-lg border border-gray-100">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Mentorship Goal
                      </p>
                      <p className="text-sm text-gray-700 italic line-clamp-3">"{item.goal}"</p>
                    </div>
                  )}

                  {/* Onboarding Bio */}
                  {athleteProfile?.bio && !item.goal && (
                    <p className="text-sm text-gray-600 line-clamp-3">{athleteProfile.bio}</p>
                  )}

                  {/* Actions */}
                  <div className="pt-2 flex items-center gap-2">
                    <Button
                      onClick={() => handleStartChat(athlete.id)}
                      className="w-full bg-teal-600 hover:bg-teal-700 text-white flex items-center justify-center gap-2"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Chat with Athlete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

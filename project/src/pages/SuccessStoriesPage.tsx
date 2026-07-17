import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getSuccessStories, createSuccessStory } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  Trophy,
  Quote,
  Sparkles,
  Award,
  ChevronRight,
  BookOpen,
  Loader2,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function SuccessStoriesPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [achievement, setAchievement] = useState('');
  const [storyText, setStoryText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: stories, isLoading } = useQuery({
    queryKey: ['successStories'],
    queryFn: () => getSuccessStories(),
  });

  const featuredStory = stories?.find(s => s.featured);
  const remainingStories = stories?.filter(s => s.id !== featuredStory?.id) || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!title.trim() || !storyText.trim()) {
      toast.error('Title and Story are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      await createSuccessStory({
        athleteId: user.id,
        title: title.trim(),
        story: storyText.trim(),
        achievement: achievement.trim() || undefined,
      });
      toast.success('Your success story has been submitted! It will appear on the feed once approved.');
      setIsDialogOpen(false);
      setTitle('');
      setAchievement('');
      setStoryText('');
      queryClient.invalidateQueries({ queryKey: ['successStories'] });
    } catch (error) {
      toast.error('Failed to submit success story. Please try again.');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Success Stories</h1>
          <p className="text-gray-500">Inspiring journeys of women athletes overcoming challenges across India</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 self-start md:self-auto">
          {user ? (
            <Button 
              className="bg-teal-600 hover:bg-teal-700 text-white"
              onClick={() => setIsDialogOpen(true)}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Share Your Story
            </Button>
          ) : (
            <Button variant="outline" asChild>
              <Link to="/login">Sign in to Share Story</Link>
            </Button>
          )}
          <Badge className="bg-amber-100 text-amber-700">
            <Trophy className="w-3.5 h-3.5 mr-1" />
            Champion Spotlights
          </Badge>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <Skeleton className="h-64 w-full rounded-xl" />
          <div className="grid md:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-48 rounded-xl" />
            ))}
          </div>
        </div>
      ) : stories && stories.length > 0 ? (
        <div className="space-y-8">
          {/* Featured Quote / Story */}
          {featuredStory && (
            <Card className="bg-gradient-to-r from-teal-900 to-emerald-950 text-white overflow-hidden shadow-lg border-none relative">
              <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                <Quote className="w-48 h-48" />
              </div>
              <CardContent className="p-8 md:p-12 space-y-6 max-w-4xl relative">
                <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white border-none">
                  Featured Spotlight
                </Badge>
                <div className="space-y-3">
                  <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight leading-tight">
                    &ldquo;{featuredStory.title}&rdquo;
                  </h2>
                  <p className="text-teal-200 text-sm md:text-base font-semibold">
                    Achievement: {featuredStory.achievement}
                  </p>
                </div>
                <p className="text-gray-100 leading-relaxed text-sm md:text-base italic">
                  {featuredStory.story}
                </p>
                <div className="flex items-center gap-3 pt-2">
                  <div className="w-10 h-10 rounded-full bg-teal-800 flex items-center justify-center font-bold text-teal-100 text-sm border border-teal-700">
                    {featuredStory.athlete?.full_name?.charAt(0) || 'A'}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{featuredStory.athlete?.full_name}</p>
                    <p className="text-xs text-teal-300">SHAKTHI Athlete</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Grid of Other Stories */}
          {remainingStories.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-bold text-lg text-gray-900">More Inspiring Journeys</h3>
              <div className="grid md:grid-cols-2 gap-6">
                {remainingStories.map((s) => (
                  <Card key={s.id} className="border-gray-200 hover:shadow-md transition-shadow flex flex-col justify-between">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <CardTitle className="text-base text-gray-900 font-bold leading-snug">
                            {s.title}
                          </CardTitle>
                          {s.achievement && (
                            <p className="text-xs font-semibold text-emerald-600">
                              {s.achievement}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4 flex-1 flex flex-col justify-between">
                      <p className="text-xs text-gray-600 leading-relaxed line-clamp-4">
                        {s.story}
                      </p>
                      <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center font-bold text-teal-700 text-[10px]">
                            {s.athlete?.full_name?.charAt(0) || 'A'}
                          </div>
                          <span className="font-medium text-gray-700">{s.athlete?.full_name}</span>
                        </div>
                        <span className="text-[10px] text-gray-400">
                          Published: {new Date(s.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <Card className="border-dashed py-12">
          <CardContent className="flex flex-col items-center justify-center text-center space-y-3">
            <Trophy className="w-12 h-12 text-gray-300" />
            <div className="space-y-1">
              <h3 className="font-semibold text-gray-900 text-lg">No Stories Published</h3>
              <p className="text-sm text-gray-500 max-w-sm">
                No athlete success stories have been published to the community feed yet.
              </p>
            </div>
            <div className="flex gap-3 mt-4">
              {user ? (
                <Button 
                  variant="default" 
                  className="bg-amber-600 hover:bg-amber-700"
                  onClick={() => setIsDialogOpen(true)}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Submit Your Journey
                </Button>
              ) : (
                <Button variant="default" className="bg-amber-600 hover:bg-amber-700" asChild>
                  <Link to="/login">
                    Submit Your Journey
                  </Link>
                </Button>
              )}
              <Button variant="outline" asChild>
                <Link to="/help">
                  Read Community Guidelines
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Share Story Dialog */}
      {user && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Share Your Success Story</DialogTitle>
              <DialogDescription>
                Inspire others in the SHAKTHI community by sharing your achievements and athletic journey.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="title">Story Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Overcoming hurdles to win State Gold"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="achievement">Achievement (Optional)</Label>
                <Input
                  id="achievement"
                  placeholder="e.g., Gold Medalist, Under-19 Athletics"
                  value={achievement}
                  onChange={(e) => setAchievement(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="story">Your Story</Label>
                <Textarea
                  id="story"
                  placeholder="Tell your story. What challenges did you face? How did you overcome them? Who helped you along the way?"
                  className="min-h-[150px]"
                  value={storyText}
                  onChange={(e) => setStoryText(e.target.value)}
                  required
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-teal-600 hover:bg-teal-700" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    'Publish Story'
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}


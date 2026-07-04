import { useQuery } from '@tanstack/react-query';
import { getSuccessStories } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Trophy,
  Quote,
  Sparkles,
  Award,
  ChevronRight,
  BookOpen,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function SuccessStoriesPage() {
  const { data: stories, isLoading } = useQuery({
    queryKey: ['successStories'],
    queryFn: () => getSuccessStories(),
  });

  const featuredStory = stories?.find(s => s.featured);
  const remainingStories = stories?.filter(s => s.id !== featuredStory?.id) || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Success Stories</h1>
          <p className="text-gray-500">Inspiring journeys of women athletes overcoming challenges across India</p>
        </div>
        <Badge className="bg-amber-100 text-amber-700 self-start">
          <Trophy className="w-3.5 h-3.5 mr-1" />
          Champion Spotlights
        </Badge>
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
              <Button variant="default" className="bg-amber-600 hover:bg-amber-700" asChild>
                <Link to="/help">
                  Submit Your Journey
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/help">
                  Read Community Guidelines
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}


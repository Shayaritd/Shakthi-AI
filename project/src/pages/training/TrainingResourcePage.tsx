import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getTrainingResourceById, incrementResourceViewCount } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ChevronLeft,
  Clock,
  User,
  Eye,
  Calendar,
  BookOpen,
  Video,
  FileText,
  Bookmark,
  Share2,
} from 'lucide-react';
import { format } from 'date-fns';
import { useEffect } from 'react';

const CATEGORY_LABELS: Record<string, string> = {
  SKILLS_DRILLS: 'Skills & Drills',
  TECHNIQUE: 'Technique',
  NUTRITION: 'Nutrition',
  INJURY_PREVENTION: 'Injury Prevention',
  MENTAL_WELLNESS: 'Mental Wellness',
  MENSTRUAL_HEALTH: 'Menstrual Health',
  STRENGTH_CONDITIONING: 'Strength & Conditioning',
  RECOVERY: 'Recovery',
};

export default function TrainingResourcePage() {
  const { id } = useParams<{ id: string }>();

  // Invalidate queries or refetch when viewing
  const { data: resource, isLoading, error } = useQuery({
    queryKey: ['trainingResource', id],
    queryFn: () => getTrainingResourceById(id!),
    enabled: !!id,
  });

  // Increment view count when article mounts
  const { mutate: viewMutate } = useMutation({
    mutationFn: () => incrementResourceViewCount(id!),
  });

  useEffect(() => {
    if (id) {
      viewMutate();
    }
  }, [id, viewMutate]);

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <Button variant="ghost" disabled>
          <ChevronLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        <Card>
          <CardContent className="p-6 space-y-6">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-6 w-3/4" />
            <div className="flex gap-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-64 w-full rounded-lg" />
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !resource) {
    return (
      <div className="text-center py-12 space-y-4">
        <h2 className="text-xl font-bold text-gray-900">Training resource not found</h2>
        <p className="text-gray-500 text-sm">The article you are trying to read may have been moved or deleted.</p>
        <Button asChild className="bg-rose-600 hover:bg-rose-700">
          <Link to="/training">Back to Training Center</Link>
        </Button>
      </div>
    );
  }

  const catLabel = CATEGORY_LABELS[resource.category] || resource.category;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" asChild className="text-gray-600 hover:text-gray-900">
          <Link to="/training">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Training Center
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="h-9 w-9 text-gray-500">
            <Bookmark className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-9 w-9 text-gray-500">
            <Share2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Main Content Card */}
      <Card className="border-gray-200 shadow-md overflow-hidden">
        {/* Resource Banner/Media Area */}
        <div className="h-64 sm:h-96 bg-rose-50 flex items-center justify-center relative border-b border-gray-100">
          {resource.video_url ? (
            <div className="w-full h-full relative flex items-center justify-center bg-black">
              {/* Simulated Embedded Video Player or Real URL if valid */}
              {resource.video_url.includes('simulated') || !resource.video_url.startsWith('http') ? (
                <div className="text-center space-y-3 p-6 text-gray-300">
                  <Video className="w-16 h-16 mx-auto text-rose-500 animate-pulse" />
                  <p className="text-sm font-semibold">SHAKTHI Safe-Stream Media Player</p>
                  <p className="text-xs text-gray-500">Video source: {resource.video_url}</p>
                </div>
              ) : (
                <video
                  src={resource.video_url}
                  controls
                  className="w-full h-full object-contain"
                  poster="/placeholder-video-poster.jpg"
                />
              )}
            </div>
          ) : (
            <div className="text-center space-y-2">
              <FileText className="w-20 h-20 mx-auto text-rose-300" />
              <p className="text-xs text-gray-400 font-medium">SHAKTHI Verified Safe Article</p>
            </div>
          )}

          {/* Absolute Tags */}
          <Badge className="absolute top-4 left-4 bg-white text-rose-700 border border-rose-200 hover:bg-white text-xs font-semibold px-2.5 py-1">
            {catLabel}
          </Badge>
          {resource.sport && (
            <Badge variant="secondary" className="absolute top-4 right-4 bg-teal-50 text-teal-700 border border-teal-100 hover:bg-teal-50 text-xs font-semibold px-2.5 py-1">
              {resource.sport}
            </Badge>
          )}
        </div>

        <CardHeader className="p-6 pb-4 space-y-3">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight">
            {resource.title}
          </h1>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-gray-500 pt-2 border-b pb-4 border-gray-100">
            <span className="flex items-center gap-1.5">
              <User className="w-4 h-4 text-gray-400" />
              <span className="font-semibold text-gray-800">{resource.author || 'SHAKTHI Expert'}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-gray-400" />
              {resource.duration_minutes ? `${resource.duration_minutes} mins read` : '15 mins read'}
            </span>
            <span className="flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-gray-400" />
              {resource.view_count !== undefined ? resource.view_count + 1 : 1} views
            </span>
            {resource.created_at && (
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-gray-400" />
                {format(new Date(resource.created_at), 'MMMM d, yyyy')}
              </span>
            )}
          </div>
        </CardHeader>

        {/* Article Body Content */}
        <CardContent className="p-6 pt-0">
          <div className="prose max-w-none text-sm sm:text-base text-gray-700 leading-relaxed space-y-5 whitespace-pre-line">
            {resource.content}
          </div>

          {resource.tags && resource.tags.length > 0 && (
            <div className="mt-8 pt-6 border-t border-gray-100">
              <h5 className="text-xs font-bold text-gray-900 mb-2.5">Topic Tags</h5>
              <div className="flex flex-wrap gap-1.5">
                {resource.tags.map((tag: string) => (
                  <Badge key={tag} variant="secondary" className="bg-gray-100 text-gray-700 hover:bg-gray-250 text-xs px-2.5 py-0.5 rounded-md font-medium">
                    #{tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Safety Commitment Banner */}
          <div className="mt-8 p-4 bg-gradient-to-r from-rose-50 to-amber-50 rounded-xl border border-rose-100 flex items-start gap-3">
            <BookOpen className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-xs font-bold text-rose-900">SHAKTHI Educational Safe Space</p>
              <p className="text-[11px] text-rose-700">
                All training resources are authored by verified coaches and professionals, adhering to safety codes and menstrual health guidelines. If you have coaching questions, you can discuss them with your verified mentor.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

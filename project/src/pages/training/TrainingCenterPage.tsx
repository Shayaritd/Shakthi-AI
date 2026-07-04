import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getTrainingResources } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BookOpen,
  Search,
  Clock,
  User,
  Sparkles,
  Award,
  Video,
  FileText,
  FileQuestion,
} from 'lucide-react';
import { SPORTS_LIST } from '@/constants/theme';
import { Link } from 'react-router-dom';

const TRAINING_CATEGORIES = [
  { value: 'SKILLS_DRILLS', label: 'Skills & Drills' },
  { value: 'TECHNIQUE', label: 'Technique' },
  { value: 'NUTRITION', label: 'Nutrition' },
  { value: 'INJURY_PREVENTION', label: 'Injury Prevention' },
  { value: 'MENTAL_WELLNESS', label: 'Mental Wellness' },
  { value: 'MENSTRUAL_HEALTH', label: 'Menstrual Health' },
  { value: 'STRENGTH_CONDITIONING', label: 'Strength & Conditioning' },
  { value: 'RECOVERY', label: 'Recovery' },
];

export default function TrainingCenterPage() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sportFilter, setSportFilter] = useState('');

  const filters = {
    category: categoryFilter || undefined,
    sport: sportFilter || undefined,
  };

  const { data: resources, isLoading } = useQuery({
    queryKey: ['trainingResources', filters],
    queryFn: () => getTrainingResources(filters),
  });

  const filteredResources = resources?.filter((res) => {
    if (search) {
      const searchLower = search.toLowerCase();
      return (
        res.title.toLowerCase().includes(searchLower) ||
        (res.content && res.content.toLowerCase().includes(searchLower))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Training Center</h1>
          <p className="text-gray-500">Learn from certified coaches, nutritionists, and sports scientists</p>
        </div>
        <Badge className="bg-rose-100 text-rose-700 self-start">
          <BookOpen className="w-3.5 h-3.5 mr-1" />
          Self-paced Courses
        </Badge>
      </div>

      {/* Filters */}
      <Card className="border-rose-50 shadow-sm">
        <CardContent className="p-4 space-y-4">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search training guides, tutorials, and workouts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {TRAINING_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sportFilter} onValueChange={setSportFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Sport Specific" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sports / General</SelectItem>
                {SPORTS_LIST.map((sport) => (
                  <SelectItem key={sport} value={sport}>
                    {sport}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center text-xs text-rose-600 font-semibold px-2">
              <Sparkles className="w-3.5 h-3.5 mr-1 shrink-0" />
              AI recommends matching resources based on your profile sport.
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resource Listings */}
      {isLoading ? (
        <div className="grid md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="h-64">
              <CardContent className="p-6 space-y-4">
                <Skeleton className="h-32 w-full rounded-md" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredResources && filteredResources.length > 0 ? (
        <div className="grid md:grid-cols-3 gap-6">
          {filteredResources.map((res) => {
            const catLabel = TRAINING_CATEGORIES.find(c => c.value === res.category)?.label || res.category;
            return (
              <Card key={res.id} className="border-gray-200 hover:shadow-md transition-shadow flex flex-col overflow-hidden">
                <div className="h-40 bg-rose-50 flex items-center justify-center relative border-b border-gray-100">
                  {res.video_url ? (
                    <Video className="w-12 h-12 text-rose-400" />
                  ) : (
                    <FileText className="w-12 h-12 text-rose-400" />
                  )}
                  <Badge className="absolute top-3 left-3 bg-white text-rose-700 border border-rose-200 hover:bg-white text-xs">
                    {catLabel}
                  </Badge>
                  {res.sport && (
                    <Badge variant="secondary" className="absolute top-3 right-3 bg-teal-50 text-teal-700 border border-teal-100 hover:bg-teal-50 text-xs">
                      {res.sport}
                    </Badge>
                  )}
                </div>
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-base text-gray-900 font-bold leading-snug line-clamp-1">
                    {res.title}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-1.5 text-xs text-gray-500 pt-1">
                    <User className="w-3.5 h-3.5" />
                    <span>{res.author || 'SHAKTHI Expert'}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-3 flex-1 flex flex-col justify-between">
                  <p className="text-xs text-gray-600 line-clamp-3">
                    {res.content || 'Start learning this training program today.'}
                  </p>
                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      {res.duration_minutes ? `${res.duration_minutes} min` : '20 min'}
                    </span>
                    <Button size="sm" variant="outline" className="text-rose-600 hover:text-rose-700 h-8">
                      {res.video_url ? 'Watch Video' : 'Read Guide'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="border-dashed py-12">
          <CardContent className="flex flex-col items-center justify-center text-center space-y-3">
            <FileQuestion className="w-12 h-12 text-gray-300" />
            <div className="space-y-1">
              <h3 className="font-semibold text-gray-900 text-lg">No Guides Found</h3>
              <p className="text-sm text-gray-500 max-w-sm">
                We don't have training courses or guides uploaded for the current category or sport yet.
              </p>
            </div>
            <div className="flex gap-3 mt-4">
              <Button
                variant="default"
                className="bg-rose-600 hover:bg-rose-700"
                onClick={() => {
                  setSearch('');
                  setCategoryFilter('');
                  setSportFilter('');
                }}
              >
                Clear Selections
              </Button>
              <Button variant="outline" asChild>
                <Link to="/chat">
                  Ask AI Coach
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}


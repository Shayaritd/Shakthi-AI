import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getMentors } from '@/services/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Search,
  MapPin,
  Star,
  Shield,
  Clock,
  Users,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { SPORTS_LIST, INDIAN_STATES, LANGUAGES } from '@/constants/theme';

export default function MentorDiscoveryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [sportFilter, setSportFilter] = useState(searchParams.get('sport') || '');
  const [stateFilter, setStateFilter] = useState(searchParams.get('state') || '');
  const [languageFilter, setLanguageFilter] = useState('');

  const filters = {
    sport: sportFilter || undefined,
    state: stateFilter || undefined,
    language: languageFilter || undefined,
    verified: true,
  };

  const { data: mentors, isLoading } = useQuery({
    queryKey: ['mentors', filters],
    queryFn: () => getMentors(filters),
  });

  const filteredMentors = mentors?.filter((mentor) => {
    if (search) {
      const searchLower = search.toLowerCase();
      const matchesName = mentor.profile?.full_name?.toLowerCase().includes(searchLower);
      const matchesExpertise = mentor.expertise.some((e) =>
        e.toLowerCase().includes(searchLower)
      );
      if (!matchesName && !matchesExpertise) return false;
    }
    return true;
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set('q', search);
    if (sportFilter) params.set('sport', sportFilter);
    if (stateFilter) params.set('state', stateFilter);
    setSearchParams(params);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Find Mentors</h1>
          <p className="text-gray-500">Connect with verified coaches across India</p>
        </div>
        <Badge variant="outline" className="bg-teal-50 text-teal-700 border-teal-200 self-start">
          <Shield className="w-3 h-3 mr-1" />
          All mentors are verified
        </Badge>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search by name or expertise..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit">Search</Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Select value={sportFilter} onValueChange={setSportFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Sport" />
                </SelectTrigger>
                <SelectContent>
                  {SPORTS_LIST.map((sport) => (
                    <SelectItem key={sport} value={sport}>
                      {sport}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={stateFilter} onValueChange={setStateFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="State" />
                </SelectTrigger>
                <SelectContent>
                  {INDIAN_STATES.map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={languageFilter} onValueChange={setLanguageFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Language" />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={() => {
                  setSearch('');
                  setSportFilter('');
                  setStateFilter('');
                  setLanguageFilter('');
                  setSearchParams({});
                }}
              >
                Clear Filters
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Results */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <Skeleton className="w-16 h-16 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <Skeleton className="h-20 mt-4" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredMentors && filteredMentors.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMentors.map((mentor) => (
            <Card key={mentor.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center">
                    <span className="text-xl font-bold text-teal-700">
                      {mentor.profile?.full_name?.charAt(0) || 'M'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">
                        {mentor.profile?.full_name}
                      </h3>
                      {mentor.verified && (
                        <Shield className="w-4 h-4 text-teal-600" />
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      {Array.isArray(mentor.expertise) ? mentor.expertise.slice(0, 2).join(', ') : ''}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                      <MapPin className="w-3 h-3" />
                      {mentor.state}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1 text-amber-600">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="font-medium">{mentor.average_rating?.toFixed(1) || 'New'}</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-500">
                    <Clock className="w-3 h-3" />
                    {mentor.response_time_hours}h response
                  </div>
                  <div className="flex items-center gap-1 text-gray-500">
                    <Users className="w-3 h-3" />
                    {mentor.total_reviews} reviews
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-1">
                  {mentor.languages.slice(0, 3).map((lang) => (
                    <Badge key={lang} variant="secondary" className="text-xs">
                      {lang}
                    </Badge>
                  ))}
                </div>

                <Button className="w-full mt-4 bg-teal-600 hover:bg-teal-700" asChild>
                  <Link to={`/mentors/${mentor.user_id}`}>
                    View Profile
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900">No mentors found</h3>
          <p className="text-gray-500 mt-1">Try adjusting your filters</p>
        </div>
      )}
    </div>
  );
}

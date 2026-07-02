import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getScholarships } from '@/services/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Award,
  Search,
  MapPin,
  Calendar,
  Building,
  Star,
  ChevronRight,
  Filter,
  Home,
  IndianRupee,
} from 'lucide-react';
import { SPORTS_LIST, INDIAN_STATES } from '@/constants/theme';
import { format } from 'date-fns';

export default function ScholarshipsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [sportFilter, setSportFilter] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [girlsOnly, setGirlsOnly] = useState(true);
  const [hostelSupport, setHostelSupport] = useState(false);

  const filters = {
    sport: sportFilter || undefined,
    state: stateFilter || undefined,
    girlsOnly,
    hostelSupport: hostelSupport || undefined,
  };

  const { data: scholarships, isLoading } = useQuery({
    queryKey: ['scholarships', filters],
    queryFn: () => getScholarships(filters),
  });

  const filteredScholarships = scholarships?.filter((scholarship) => {
    if (search) {
      const searchLower = search.toLowerCase();
      return (
        scholarship.name.toLowerCase().includes(searchLower) ||
        scholarship.provider.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Scholarships</h1>
          <p className="text-gray-500">Discover scholarships for female athletes</p>
        </div>
        <Badge className="bg-amber-100 text-amber-700 self-start">
          <Star className="w-3 h-3 mr-1" />
          Curated opportunities
        </Badge>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search scholarships..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
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

              <div className="flex items-center space-x-3">
                <Checkbox
                  id="girlsOnly"
                  checked={girlsOnly}
                  onCheckedChange={(checked) => setGirlsOnly(checked as boolean)}
                />
                <label htmlFor="girlsOnly" className="text-sm cursor-pointer">
                  Girls Only
                </label>
              </div>

              <div className="flex items-center space-x-3">
                <Checkbox
                  id="hostel"
                  checked={hostelSupport}
                  onCheckedChange={(checked) => setHostelSupport(checked as boolean)}
                />
                <label htmlFor="hostel" className="text-sm cursor-pointer">
                  Hostel Support
                </label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-4" />
                <Skeleton className="h-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredScholarships && filteredScholarships.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-4">
          {filteredScholarships.map((scholarship) => (
            <Link key={scholarship.id} to={`/scholarships/${scholarship.id}`}>
              <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900 line-clamp-1">{scholarship.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                        <Building className="w-3 h-3" />
                        {scholarship.provider}
                      </div>
                    </div>
                    {scholarship.girls_only && (
                      <Badge className="bg-rose-100 text-rose-700">Girls Only</Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex items-center gap-1 text-teal-700">
                      <IndianRupee className="w-4 h-4" />
                      <span className="font-bold">
                        {scholarship.amount?.toLocaleString() || 'Variable'}
                      </span>
                    </div>
                    {scholarship.hostel_support && (
                      <Badge variant="outline" className="text-xs">
                        <Home className="w-3 h-3 mr-1" />
                        Hostel
                      </Badge>
                    )}
                  </div>

                  <p className="text-sm text-gray-600 line-clamp-2">{scholarship.description}</p>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {scholarship.deadline
                        ? format(new Date(scholarship.deadline), 'MMM d, yyyy')
                        : 'Open'}
                    </div>
                    {scholarship.state && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {scholarship.state}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Award className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900">No scholarships found</h3>
          <p className="text-gray-500 mt-1">Try adjusting your filters</p>
        </div>
      )}
    </div>
  );
}

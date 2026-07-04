import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getColleges } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Building2,
  Search,
  MapPin,
  Mail,
  Phone,
  Globe,
  Award,
  ShieldCheck,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { SPORTS_LIST, INDIAN_STATES } from '@/constants/theme';

export default function CollegesPage() {
  const [search, setSearch] = useState('');
  const [sportFilter, setSportFilter] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [sportsQuotaOnly, setSportsQuotaOnly] = useState(false);
  const [hostelOnly, setHostelOnly] = useState(false);

  const filters = {
    sport: sportFilter || undefined,
    state: stateFilter || undefined,
    sportsQuota: sportsQuotaOnly || undefined,
    hostel: hostelOnly || undefined,
  };

  const { data: colleges, isLoading } = useQuery({
    queryKey: ['colleges', filters],
    queryFn: () => getColleges(filters),
  });

  const filteredColleges = colleges?.filter((college) => {
    if (search) {
      const searchLower = search.toLowerCase();
      return (
        college.name.toLowerCase().includes(searchLower) ||
        (college.location && college.location.toLowerCase().includes(searchLower))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sports Quota Colleges</h1>
          <p className="text-gray-500">Discover academic programs with dedicated sports admissions support</p>
        </div>
        <Badge className="bg-teal-100 text-teal-700 self-start">
          <Award className="w-3.5 h-3.5 mr-1" />
          Sports Quotas Enabled
        </Badge>
      </div>

      {/* Filters */}
      <Card className="border-teal-50 shadow-sm">
        <CardContent className="p-4 space-y-4">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search colleges by name or city..."
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
                <SelectItem value="all">All Sports</SelectItem>
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
                <SelectItem value="all">All States</SelectItem>
                {INDIAN_STATES.map((state) => (
                  <SelectItem key={state} value={state}>
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <Checkbox
                id="sportsQuota"
                checked={sportsQuotaOnly}
                onCheckedChange={(checked) => setSportsQuotaOnly(!!checked)}
              />
              <label
                htmlFor="sportsQuota"
                className="text-sm font-medium text-gray-700 cursor-pointer"
              >
                Sports Quota Only
              </label>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="hostel"
                checked={hostelOnly}
                onCheckedChange={(checked) => setHostelOnly(!!checked)}
              />
              <label
                htmlFor="hostel"
                className="text-sm font-medium text-gray-700 cursor-pointer"
              >
                Hostel Support
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* College Listings */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 gap-6">
          {[1, 2, 4].map((i) => (
            <Card key={i} className="h-64">
              <CardContent className="p-6 space-y-4">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-4 w-1/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredColleges && filteredColleges.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-6">
          {filteredColleges.map((college) => {
            const sportsList = Array.isArray(college.supported_sports)
              ? college.supported_sports
              : (college.supported_sports as any)?.sports || [];

            return (
              <Card key={college.id} className="border-gray-200 hover:shadow-md transition-shadow flex flex-col justify-between">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="w-5 h-5 text-teal-600 shrink-0" />
                        <CardTitle className="text-lg text-teal-950 font-bold leading-snug">
                          {college.name}
                        </CardTitle>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span>
                          {college.location}
                          {college.state && `, ${college.state}`}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    {/* Key Badges */}
                    <div className="flex flex-wrap gap-2">
                      {college.sports_quota && (
                        <Badge className="bg-teal-50 text-teal-700 hover:bg-teal-50 border border-teal-200">
                          <ShieldCheck className="w-3 h-3 mr-1" />
                          Sports Quota
                        </Badge>
                      )}
                      {college.hostel && (
                        <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-50 border border-blue-200">
                          Hostel Available
                        </Badge>
                      )}
                      {college.fee_concession && (
                        <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border border-emerald-200">
                          {typeof college.fee_concession === 'number'
                            ? `${college.fee_concession}% Concession`
                            : college.fee_concession}
                        </Badge>
                      )}
                    </div>

                    {/* Supported Sports */}
                    {sportsList.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
                          Supported Sports
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {sportsList.map((sport: string) => (
                            <Badge key={sport} variant="secondary" className="text-xs bg-gray-100 text-gray-700 hover:bg-gray-200">
                              {sport}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-2">
                      {college.website_url && (
                        <a
                          href={college.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-teal-600 hover:underline flex items-center gap-0.5"
                        >
                          <Globe className="w-3.5 h-3.5" />
                          Website
                        </a>
                      )}
                      {college.contact_email && (
                        <a
                          href={`mailto:${college.contact_email}`}
                          className="hover:text-gray-700 flex items-center gap-0.5"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          Email
                        </a>
                      )}
                    </div>
                    {college.last_date && (
                      <span className="flex items-center text-amber-600 font-medium shrink-0">
                        <Calendar className="w-3.5 h-3.5 mr-1" />
                        Apply by: {college.last_date}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="border-dashed py-12">
          <CardContent className="flex flex-col items-center justify-center text-center space-y-3">
            <Building2 className="w-12 h-12 text-gray-300" />
            <div className="space-y-1">
              <h3 className="font-semibold text-gray-900 text-lg">No Colleges Found</h3>
              <p className="text-sm text-gray-500 max-w-sm">
                Try adjusting your search criteria or removing active filters.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setSearch('');
                setSportFilter('');
                setStateFilter('');
                setSportsQuotaOnly(false);
                setHostelOnly(false);
              }}
            >
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}


import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getOpportunities } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Calendar,
  Search,
  MapPin,
  Mail,
  Phone,
  Globe,
  Award,
  Users,
  Sparkles,
  TrendingUp,
  FileQuestion,
} from 'lucide-react';
import { SPORTS_LIST, INDIAN_STATES } from '@/constants/theme';
import { Link } from 'react-router-dom';

export default function OpportunitiesPage() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [sportFilter, setSportFilter] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [womenFocused, setWomenFocused] = useState(false);

  const filters = {
    type: typeFilter || undefined,
    sport: sportFilter || undefined,
    state: stateFilter || undefined,
    womenFocused: womenFocused || undefined,
  };

  const { data: opportunities, isLoading } = useQuery({
    queryKey: ['opportunities', filters],
    queryFn: () => getOpportunities(filters),
  });

  const filteredOpportunities = opportunities?.filter((opp) => {
    if (search) {
      const searchLower = search.toLowerCase();
      return (
        opp.title.toLowerCase().includes(searchLower) ||
        (opp.organization && opp.organization.toLowerCase().includes(searchLower)) ||
        (opp.description && opp.description.toLowerCase().includes(searchLower))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Opportunities</h1>
          <p className="text-gray-500">Find trials, tournaments, training camps, and sports careers</p>
        </div>
        <Badge className="bg-blue-100 text-blue-700 self-start">
          <TrendingUp className="w-3.5 h-3.5 mr-1" />
          Active Selection Trials
        </Badge>
      </div>

      {/* Filters */}
      <Card className="border-blue-50 shadow-sm">
        <CardContent className="p-4 space-y-4">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search opportunities by title, organization, or keywords..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Opportunity Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="TOURNAMENT">Tournament</SelectItem>
                <SelectItem value="TRIAL">Selection Trial</SelectItem>
                <SelectItem value="CAMP">Training Camp</SelectItem>
                <SelectItem value="GOVERNMENT_SCHEME">Govt Scheme</SelectItem>
              </SelectContent>
            </Select>

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
                <SelectValue placeholder="State/Region" />
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
                id="womenFocused"
                checked={womenFocused}
                onCheckedChange={(checked) => setWomenFocused(!!checked)}
              />
              <label
                htmlFor="womenFocused"
                className="text-sm font-medium text-gray-700 cursor-pointer"
              >
                Women Focused Only
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Opportunities List */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="h-60">
              <CardContent className="p-6 space-y-4">
                <Skeleton className="h-6 w-2/3" />
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-4 w-1/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredOpportunities && filteredOpportunities.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-6">
          {filteredOpportunities.map((opp) => (
            <Card key={opp.id} className="border-gray-200 hover:shadow-md transition-shadow flex flex-col justify-between">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-teal-50 text-teal-700 font-semibold border border-teal-200">
                        {opp.type}
                      </Badge>
                      {opp.women_focused && (
                        <Badge className="bg-pink-50 text-pink-700 border border-pink-200">
                          Women Focused
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg text-gray-900 font-bold leading-snug pt-1">
                      {opp.title}
                    </CardTitle>
                    <p className="text-sm font-semibold text-teal-600">{opp.organization}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {opp.description || 'No description available for this opportunity.'}
                  </p>
                  <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                    {opp.sport && (
                      <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full font-medium">
                        Sport: {opp.sport}
                      </span>
                    )}
                    {opp.location && (
                      <span className="flex items-center gap-0.5">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        {opp.location}
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-2">
                    {opp.registration_url && (
                      <a
                        href={opp.registration_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-teal-600 hover:underline flex items-center gap-0.5 font-semibold"
                      >
                        <Globe className="w-3.5 h-3.5" />
                        Register Now
                      </a>
                    )}
                    {opp.contact_email && (
                      <a
                        href={`mailto:${opp.contact_email}`}
                        className="hover:text-gray-700 flex items-center gap-0.5"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        Contact
                      </a>
                    )}
                  </div>
                  {opp.deadline && (
                    <span className="flex items-center text-amber-600 font-medium">
                      <Calendar className="w-3.5 h-3.5 mr-1" />
                      Apply by: {opp.deadline}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-dashed py-12">
          <CardContent className="flex flex-col items-center justify-center text-center space-y-3">
            <FileQuestion className="w-12 h-12 text-gray-300" />
            <div className="space-y-1">
              <h3 className="font-semibold text-gray-900 text-lg">No Opportunities Found</h3>
              <p className="text-sm text-gray-500 max-w-sm">
                We currently have no active trials, schemes, or camps listed matching these filter options.
              </p>
            </div>
            <div className="flex gap-3 mt-4">
              <Button
                variant="default"
                className="bg-teal-600 hover:bg-teal-700"
                onClick={() => {
                  setSearch('');
                  setTypeFilter('');
                  setSportFilter('');
                  setStateFilter('');
                  setWomenFocused(false);
                }}
              >
                Reset Filter Choices
              </Button>
              <Button variant="outline" asChild>
                <Link to="/chat">
                  Ask AI Coordinator
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}


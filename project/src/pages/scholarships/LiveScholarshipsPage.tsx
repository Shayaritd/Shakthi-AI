import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  searchLiveScholarships,
  getAIMatches,
  saveLiveScholarship,
  type LiveScholarship,
  type AIMatchResult,
} from '@/services/api';
import { SPORTS_LIST, INDIAN_STATES } from '@/constants/theme';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  Filter,
  ExternalLink,
  Bookmark,
  Calendar,
  MapPin,
  IndianRupee,
  Loader2,
  Sparkles,
  RefreshCw,
} from 'lucide-react';

export default function LiveScholarshipsPage() {
  const { user } = useAuth();
  const [scholarships, setScholarships] = useState<LiveScholarship[]>([]);
  const [matches, setMatches] = useState<AIMatchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [matching, setMatching] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    sport: '',
    state: '',
    girls_only: false,
    source: 'all',
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchScholarships();
  }, []);

  async function fetchScholarships() {
    setLoading(true);
    try {
      const results = await searchLiveScholarships({
        sport: filters.sport || undefined,
        state: filters.state || undefined,
        girls_only: filters.girls_only || undefined,
        source: filters.source !== 'all' ? filters.source : undefined,
      });
      setScholarships(results);
    } catch (error) {
      console.error('Failed to fetch scholarships:', error);
    } finally {
      setLoading(false);
    }
  }

  async function calculateMatches() {
    if (!user) return;
    setMatching(true);
    try {
      const athleteProfile = {
        sport: 'Athletics',
        level: 'state',
        state: 'Kerala',
        age: 17,
        goals: 'To become a professional athlete',
      };

      const items = scholarships.map(s => ({
        id: s.external_id,
        name: s.name,
        eligibility: s.eligibility,
        sport: s.sport,
        state: s.state,
        min_age: s.min_age,
        max_age: s.max_age,
        required_achievement_level: undefined,
        girls_only: s.girls_only,
        supported_sports: undefined,
      }));

      const result = await getAIMatches({
        athleteProfile,
        matchType: 'scholarship',
        items,
      });

      const matchMap = new Map(result.all_matches.map(m => [m.id, m]));
      setScholarships(prev =>
        prev.map(s => ({
          ...s,
          match_score: matchMap.get(s.external_id)?.match_score || 0,
        }))
      );
      setMatches(result.all_matches);
    } catch (error) {
      console.error('Failed to calculate matches:', error);
    } finally {
      setMatching(false);
    }
  }

  async function handleSave(scholarship: LiveScholarship) {
    if (!user) return;
    setSaving(scholarship.external_id);
    try {
      await saveLiveScholarship(user.id, scholarship, scholarship.match_score);
    } catch (error) {
      console.error('Failed to save scholarship:', error);
    } finally {
      setSaving(null);
    }
  }

  const filteredScholarships = scholarships.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.provider.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedScholarships = [...filteredScholarships].sort(
    (a, b) => (b.match_score || 0) - (a.match_score || 0)
  );

  function getMatchBadgeColor(score: number): string {
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800';
    if (score >= 40) return 'bg-orange-100 text-orange-800';
    return 'bg-gray-100 text-gray-800';
  }

  function formatAmount(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  }

  function formatDate(date?: string): string {
    if (!date) return 'Ongoing';
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Live Scholarship Search</h1>
          <p className="text-gray-500">
            Real-time scholarships from Government, Khelo India & Private Foundations
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => fetchScholarships()} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={calculateMatches} disabled={matching || scholarships.length === 0}>
            <Sparkles className="mr-2 h-4 w-4" />
            {matching ? 'Analyzing...' : 'AI Match'}
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search scholarships..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="md:w-auto"
            >
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </div>

          {showFilters && (
            <div className="mt-4 grid gap-4 md:grid-cols-4">
              <div>
                <label className="text-sm font-medium">Sport</label>
                <Select
                  value={filters.sport}
                  onValueChange={v => setFilters(prev => ({ ...prev, sport: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Sports" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Sports</SelectItem>
                    {SPORTS_LIST.map(sport => (
                      <SelectItem key={sport} value={sport}>
                        {sport}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">State</label>
                <Select
                  value={filters.state}
                  onValueChange={v => setFilters(prev => ({ ...prev, state: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All States" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All States</SelectItem>
                    {INDIAN_STATES.map(state => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Source</label>
                <Select
                  value={filters.source}
                  onValueChange={v => setFilters(prev => ({ ...prev, source: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sources</SelectItem>
                    <SelectItem value="government">Government</SelectItem>
                    <SelectItem value="khelo_india">Khelo India</SelectItem>
                    <SelectItem value="private_foundation">Private Foundations</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2">
                  <Checkbox
                    checked={filters.girls_only}
                    onCheckedChange={c => setFilters(prev => ({ ...prev, girls_only: !!c }))}
                  />
                  <span className="text-sm">Girls Only</span>
                </label>
              </div>
            </div>
          )}

          {showFilters && (
            <div className="mt-4 flex justify-end">
              <Button onClick={fetchScholarships} disabled={loading}>
                Apply Filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {loading ? 'Searching...' : `${sortedScholarships.length} scholarships found`}
        </p>
        {matches.length > 0 && (
          <Badge variant="outline" className="bg-teal-50 text-teal-700">
            <Sparkles className="mr-1 h-3 w-3" />
            AI Matches: {matches.filter(m => m.match_score >= 70).length} excellent
          </Badge>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sortedScholarships.map(scholarship => (
            <Card key={scholarship.external_id} className="flex flex-col">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{scholarship.name}</CardTitle>
                    <p className="text-sm text-gray-500">{scholarship.provider}</p>
                  </div>
                  {scholarship.match_score !== undefined && scholarship.match_score > 0 && (
                    <Badge className={getMatchBadgeColor(scholarship.match_score)}>
                      {Math.round(scholarship.match_score)}% match
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <IndianRupee className="h-4 w-4 text-green-600" />
                    <span className="font-semibold text-green-600">
                      {formatAmount(scholarship.amount)}
                    </span>
                    <span className="text-sm text-gray-500">/year</span>
                  </div>

                  {scholarship.deadline && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>Deadline: {formatDate(scholarship.deadline)}</span>
                    </div>
                  )}

                  {scholarship.state && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>{scholarship.state}</span>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-xs">
                      {scholarship.source.replace('_', ' ').toUpperCase()}
                    </Badge>
                    {scholarship.girls_only && (
                      <Badge variant="outline" className="border-pink-200 bg-pink-50 text-xs text-pink-700">
                        Girls Only
                      </Badge>
                    )}
                    {scholarship.hostel_support && (
                      <Badge variant="outline" className="border-blue-200 bg-blue-50 text-xs text-blue-700">
                        Hostel
                      </Badge>
                    )}
                  </div>

                  {scholarship.eligibility && (
                    <p className="text-sm text-gray-600 line-clamp-2">{scholarship.eligibility}</p>
                  )}
                </div>
              </CardContent>
              <CardContent className="pt-0">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleSave(scholarship)}
                    disabled={saving === scholarship.external_id}
                  >
                    {saving === scholarship.external_id ? (
                      <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                    ) : (
                      <Bookmark className="mr-1 h-4 w-4" />
                    )}
                    Save
                  </Button>
                  {scholarship.application_url && (
                    <Button size="sm" variant="default" asChild>
                      <a href={scholarship.application_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-1 h-4 w-4" />
                        Apply
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loading && sortedScholarships.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-gray-500">No scholarships found matching your criteria</p>
            <Button variant="link" onClick={() => setFilters({ sport: '', state: '', girls_only: false, source: 'all' })}>
              Clear filters
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

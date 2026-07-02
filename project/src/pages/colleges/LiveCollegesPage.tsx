import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  searchLiveColleges,
  getAIMatches,
  saveLiveCollege,
  type LiveCollege,
  type AIMatchResult,
} from '@/services/api';
import { INDIAN_STATES } from '@/constants/theme';
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
  MapPin,
  Loader2,
  Sparkles,
  RefreshCw,
  Trophy,
  GraduationCap,
  Building2,
  GitCompare,
} from 'lucide-react';

export default function LiveCollegesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [colleges, setColleges] = useState<LiveCollege[]>([]);
  const [matches, setMatches] = useState<AIMatchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [matching, setMatching] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [compareList, setCompareList] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    state: '',
    sports_quota: false,
    source: 'all',
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchColleges();
  }, []);

  async function fetchColleges() {
    setLoading(true);
    try {
      const results = await searchLiveColleges({
        state: filters.state || undefined,
        sports_quota: filters.sports_quota || undefined,
        source: filters.source !== 'all' ? filters.source : undefined,
      });
      setColleges(results);
    } catch (error) {
      console.error('Failed to fetch colleges:', error);
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
        goals: 'To become a professional athlete and get a college education',
      };

      const items = colleges.map(c => ({
        id: c.external_id,
        name: c.name,
        eligibility: undefined,
        sport: undefined,
        state: c.state,
        min_age: undefined,
        max_age: undefined,
        required_achievement_level: c.required_achievement_level,
        girls_only: undefined,
        supported_sports: c.supported_sports,
      }));

      const result = await getAIMatches({
        athleteProfile,
        matchType: 'college',
        items,
      });

      const matchMap = new Map(result.all_matches.map(m => [m.id, m]));
      setColleges(prev =>
        prev.map(c => ({
          ...c,
          match_score: matchMap.get(c.external_id)?.match_score || 0,
        }))
      );
      setMatches(result.all_matches);
    } catch (error) {
      console.error('Failed to calculate matches:', error);
    } finally {
      setMatching(false);
    }
  }

  async function handleSave(college: LiveCollege) {
    if (!user) return;
    setSaving(college.external_id);
    try {
      await saveLiveCollege(user.id, college, college.match_score);
    } catch (error) {
      console.error('Failed to save college:', error);
    } finally {
      setSaving(null);
    }
  }

  function toggleCompare(externalId: string) {
    setCompareList(prev =>
      prev.includes(externalId)
        ? prev.filter(id => id !== externalId)
        : prev.length < 3
          ? [...prev, externalId]
          : prev
    );
  }

  const filteredColleges = colleges.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedColleges = [...filteredColleges].sort((a, b) => {
    if (a.nirf_ranking !== undefined && b.nirf_ranking !== undefined) {
      return a.nirf_ranking - b.nirf_ranking;
    }
    if (a.nirf_ranking !== undefined) return -1;
    if (b.nirf_ranking !== undefined) return 1;
    return (b.match_score || 0) - (a.match_score || 0);
  });

  const collegesToCompare = colleges.filter(c => compareList.includes(c.external_id));

  function getMatchBadgeColor(score: number): string {
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800';
    if (score >= 40) return 'bg-orange-100 text-orange-800';
    return 'bg-gray-100 text-gray-800';
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Live College Search</h1>
          <p className="text-gray-500">
            Real-time college data from NIRF, UGC & SAI institutes
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {compareList.length > 0 && (
            <Button
              variant="outline"
              onClick={() => navigate('/colleges/compare', { state: { colleges: collegesToCompare } })}
            >
              <GitCompare className="mr-2 h-4 w-4" />
              Compare ({compareList.length})
            </Button>
          )}
          <Button variant="outline" onClick={() => fetchColleges()} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={calculateMatches} disabled={matching || colleges.length === 0}>
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
                placeholder="Search colleges..."
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
            <div className="mt-4 grid gap-4 md:grid-cols-3">
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
                    <SelectItem value="nirf">NIRF Rankings</SelectItem>
                    <SelectItem value="ugc">UGC Colleges</SelectItem>
                    <SelectItem value="sai">SAI Institutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2">
                  <Checkbox
                    checked={filters.sports_quota}
                    onCheckedChange={c => setFilters(prev => ({ ...prev, sports_quota: !!c }))}
                  />
                  <span className="text-sm">Sports Quota Only</span>
                </label>
              </div>
            </div>
          )}

          {showFilters && (
            <div className="mt-4 flex justify-end">
              <Button onClick={fetchColleges} disabled={loading}>
                Apply Filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {loading ? 'Searching...' : `${sortedColleges.length} colleges found`}
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
          {sortedColleges.map(college => (
            <Card key={college.external_id} className="flex flex-col">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{college.name}</CardTitle>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-gray-500">
                      {college.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {college.location}
                        </span>
                      )}
                      {college.nirf_ranking && (
                        <Badge variant="secondary" className="font-mono text-xs">
                          NIRF #{college.nirf_ranking}
                        </Badge>
                      )}
                    </div>
                  </div>
                  {college.match_score !== undefined && college.match_score > 0 && (
                    <Badge className={getMatchBadgeColor(college.match_score)}>
                      {Math.round(college.match_score)}% match
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {college.sports_quota && (
                      <div className="flex items-center gap-1 text-green-700">
                        <Trophy className="h-4 w-4" />
                        <span>Sports Quota</span>
                      </div>
                    )}
                    {college.hostel && (
                      <div className="flex items-center gap-1 text-blue-700">
                        <Building2 className="h-4 w-4" />
                        <span>Hostel</span>
                      </div>
                    )}
                    {college.fee_concession > 0 && (
                      <div className="flex items-center gap-1 text-purple-700">
                        <GraduationCap className="h-4 w-4" />
                        <span>{college.fee_concession}% Fee Relief</span>
                      </div>
                    )}
                  </div>

                  {college.supported_sports.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-1">Supported Sports</p>
                      <div className="flex flex-wrap gap-1">
                        {college.supported_sports.slice(0, 4).map(sport => (
                          <Badge key={sport} variant="outline" className="text-xs">
                            {sport}
                          </Badge>
                        ))}
                        {college.supported_sports.length > 4 && (
                          <Badge variant="outline" className="text-xs">
                            +{college.supported_sports.length - 4} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {college.quota_rules && (
                    <p className="text-sm text-gray-600 line-clamp-2">{college.quota_rules}</p>
                  )}

                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {college.source.toUpperCase()}
                    </Badge>
                    {college.required_achievement_level && (
                      <Badge variant="outline" className="text-xs text-orange-700">
                        Min: {college.required_achievement_level} level
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardContent className="pt-0">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className={`flex-1 ${compareList.includes(college.external_id) ? 'border-teal-500 text-teal-700' : ''}`}
                    onClick={() => toggleCompare(college.external_id)}
                    disabled={!compareList.includes(college.external_id) && compareList.length >= 3}
                  >
                    <GitCompare className="mr-1 h-4 w-4" />
                    {compareList.includes(college.external_id) ? 'Added' : 'Compare'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleSave(college)}
                    disabled={saving === college.external_id}
                  >
                    {saving === college.external_id ? (
                      <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                    ) : (
                      <Bookmark className="mr-1 h-4 w-4" />
                    )}
                    Save
                  </Button>
                  {college.website_url && (
                    <Button size="sm" variant="default" asChild>
                      <a href={college.website_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loading && sortedColleges.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-gray-500">No colleges found matching your criteria</p>
            <Button variant="link" onClick={() => setFilters({ state: '', sports_quota: false, source: 'all' })}>
              Clear filters
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

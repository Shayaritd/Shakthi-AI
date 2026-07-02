import { useLocation } from 'react-router-dom';
import type { LiveCollege } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  MapPin,
  Trophy,
  Building2,
  GraduationCap,
  ExternalLink,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CollegeComparePage() {
  const location = useLocation();
  const colleges = (location.state?.colleges || []) as LiveCollege[];

  if (colleges.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Compare Colleges</h1>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-gray-500 mb-4">Select 2-3 colleges to compare</p>
            <Button variant="outline" onClick={() => window.history.back()}>
              Go Back to Search
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const features = [
    {
      label: 'NIRF Ranking',
      key: 'nirf_ranking',
      format: (v: number | undefined) => v ? `#${v}` : 'N/A',
    },
    {
      label: 'Sports Quota',
      key: 'sports_quota',
      format: (v: boolean) => v ? 'Yes' : 'No',
    },
    {
      label: 'Hostel',
      key: 'hostel',
      format: (v: boolean) => v ? 'Available' : 'Not Available',
    },
    {
      label: 'Fee Concession',
      key: 'fee_concession',
      format: (v: number) => `${v}%`,
    },
    {
      label: 'Location',
      key: 'location',
      format: (v: string | undefined) => v || 'N/A',
    },
    {
      label: 'State',
      key: 'state',
      format: (v: string | undefined) => v || 'N/A',
    },
  ];

  function getBestValue(key: string): number | undefined {
    if (key === 'nirf_ranking') {
      const validRankings = colleges
        .map(c => c.nirf_ranking)
        .filter((r): r is number => r !== undefined);
      return validRankings.length > 0 ? Math.min(...validRankings) : undefined;
    }
    if (key === 'fee_concession') {
      return Math.max(...colleges.map(c => c.fee_concession));
    }
    return undefined;
  }

  function getMatchScore(score: number): { color: string; label: string } {
    if (score >= 80) return { color: 'bg-green-100 text-green-800', label: 'Excellent' };
    if (score >= 60) return { color: 'bg-yellow-100 text-yellow-800', label: 'Good' };
    if (score >= 40) return { color: 'bg-orange-100 text-orange-800', label: 'Moderate' };
    return { color: 'bg-gray-100 text-gray-800', label: 'Low' };
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Compare Colleges</h1>
          <p className="text-gray-500">Side-by-side comparison of {colleges.length} colleges</p>
        </div>
        <Button variant="outline" onClick={() => window.history.back()}>
          <X className="mr-2 h-4 w-4" />
          Clear
        </Button>
      </div>

      <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${colleges.length}, 1fr)` }}>
        {colleges.map((college, index) => {
          const matchInfo = college.match_score ? getMatchScore(college.match_score) : null;
          const bestNirf = getBestValue('nirf_ranking');
          const bestFee = getBestValue('fee_concession');

          return (
            <Card key={college.external_id} className="flex flex-col">
              <CardHeader className="text-center border-b">
                <CardTitle className="text-lg">{college.name}</CardTitle>
                <div className="flex items-center justify-center gap-1 text-sm text-gray-500">
                  <MapPin className="h-3 w-3" />
                  {college.location || college.state || 'India'}
                </div>
                <Badge variant="outline" className="mx-auto mt-2">
                  {college.source.toUpperCase()}
                </Badge>
                {matchInfo && (
                  <Badge className={`mx-auto mt-2 ${matchInfo.color}`}>
                    {Math.round(college.match_score!)}% Match - {matchInfo.label}
                  </Badge>
                )}
              </CardHeader>
              <CardContent className="flex-1 pt-4">
                <div className="space-y-4">
                  {features.map(feature => {
                    const value = college[feature.key as keyof LiveCollege];
                    const formattedValue = feature.format(value as never);
                    const isBest =
                      feature.key === 'nirf_ranking' && value === bestNirf ||
                      feature.key === 'fee_concession' && value === bestFee;

                    return (
                      <div key={feature.key} className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">{feature.label}</span>
                        <span className={`font-medium ${isBest ? 'text-green-600' : ''}`}>
                          {formattedValue}
                          {isBest && ' (Best)'}
                        </span>
                      </div>
                    );
                  })}

                  <div className="pt-2 border-t">
                    <p className="text-sm font-medium text-gray-700 mb-2">Supported Sports</p>
                    <div className="flex flex-wrap gap-1">
                      {college.supported_sports.map(sport => (
                        <Badge key={sport} variant="outline" className="text-xs">
                          {sport}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t">
                    <p className="text-sm font-medium text-gray-700 mb-2">Academic Streams</p>
                    <div className="flex flex-wrap gap-1">
                      {college.academic_streams.map(stream => (
                        <Badge key={stream} variant="secondary" className="text-xs">
                          {stream}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {college.quota_rules && (
                    <div className="pt-2 border-t">
                      <p className="text-sm font-medium text-gray-700 mb-1">Quota Rules</p>
                      <p className="text-xs text-gray-600">{college.quota_rules}</p>
                    </div>
                  )}

                  {college.required_achievement_level && (
                    <div className="pt-2 border-t">
                      <p className="text-sm font-medium text-gray-700 mb-1">Minimum Requirement</p>
                      <Badge variant="outline" className="text-orange-700">
                        <Trophy className="mr-1 h-3 w-3" />
                        {college.required_achievement_level} level
                      </Badge>
                    </div>
                  )}

                  <div className="pt-4 border-t grid grid-cols-2 gap-2 text-xs text-gray-600">
                    <div className="flex items-center gap-1">
                      <Building2 className="h-3 w-3" />
                      Hostel: {college.hostel ? 'Yes' : 'No'}
                    </div>
                    <div className="flex items-center gap-1">
                      <GraduationCap className="h-3 w-3" />
                      Fee Relief: {college.fee_concession}%
                    </div>
                  </div>

                  {college.website_url && (
                    <Button variant="outline" className="w-full mt-4" asChild>
                      <a href={college.website_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Visit Website
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm text-gray-500">Best Overall Ranking</p>
              <p className="font-semibold">
                {(() => {
                  const withRanking = colleges.filter(c => c.nirf_ranking);
                  if (withRanking.length === 0) return 'N/A';
                  const best = withRanking.reduce((a, b) =>
                    (a.nirf_ranking || 999) < (b.nirf_ranking || 999) ? a : b
                  );
                  return `${best.name} (NIRF #${best.nirf_ranking})`;
                })()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Highest Fee Concession</p>
              <p className="font-semibold">
                {(() => {
                  const best = colleges.reduce((a, b) =>
                    a.fee_concession > b.fee_concession ? a : b
                  );
                  return `${best.name} (${best.fee_concession}%)`;
                })()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Most Sports Programs</p>
              <p className="font-semibold">
                {(() => {
                  const best = colleges.reduce((a, b) =>
                    a.supported_sports.length > b.supported_sports.length ? a : b
                  );
                  return `${best.name} (${best.supported_sports.length} sports)`;
                })()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

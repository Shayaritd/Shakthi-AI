import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getMentorById, getMentorReviews } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Shield,
  Star,
  MapPin,
  Clock,
  Users,
  Calendar,
  MessageSquare,
  Award,
  Globe,
  CheckCircle,
  ChevronLeft,
} from 'lucide-react';
import { format } from 'date-fns';

export default function MentorDetailPage() {
  const { id } = useParams();

  const { data: mentor, isLoading } = useQuery({
    queryKey: ['mentor', id],
    queryFn: () => getMentorById(id!),
    enabled: !!id,
  });

  const { data: reviews, isLoading: reviewsLoading } = useQuery({
    queryKey: ['mentorReviews', id],
    queryFn: () => getMentorReviews(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  if (!mentor) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-bold text-gray-900">Mentor not found</h2>
        <Button asChild className="mt-4">
          <Link to="/mentors">Back to Mentors</Link>
        </Button>
      </div>
    );
  }

  const ratingCategories = [
    { label: 'Respectful', value: reviews?.reduce((acc, r) => acc + r.respectful, 0)! / (reviews?.length || 1) || 0 },
    { label: 'Helpful', value: reviews?.reduce((acc, r) => acc + r.helpful, 0)! / (reviews?.length || 1) || 0 },
    { label: 'Knowledgeable', value: reviews?.reduce((acc, r) => acc + r.knowledgeable, 0)! / (reviews?.length || 1) || 0 },
    { label: 'Safe', value: reviews?.reduce((acc, r) => acc + r.safe_communication, 0)! / (reviews?.length || 1) || 0 },
    { label: 'Punctual', value: reviews?.reduce((acc, r) => acc + r.punctual, 0)! / (reviews?.length || 1) || 0 },
  ];

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button variant="ghost" asChild>
        <Link to="/mentors">
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Mentors
        </Link>
      </Button>

      {/* Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <Avatar className="w-24 h-24">
              <AvatarImage src={mentor.profile?.avatar_url} />
              <AvatarFallback className="bg-teal-100 text-teal-700 text-2xl font-bold">
                {mentor.profile?.full_name?.charAt(0) || 'M'}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold text-gray-900">{mentor.profile?.full_name}</h1>
                {mentor.verified && (
                  <Badge className="bg-teal-100 text-teal-700">
                    <Shield className="w-3 h-3 mr-1" />
                    Verified Mentor
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-4 mt-2 text-gray-600">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {mentor.district}, {mentor.state}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-4">
                {mentor.expertise.map((exp) => (
                  <Badge key={exp} variant="secondary">
                    {exp}
                  </Badge>
                ))}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                <div className="text-center p-3 rounded-lg bg-amber-50">
                  <div className="flex items-center justify-center gap-1 text-amber-600">
                    <Star className="w-5 h-5 fill-current" />
                    <span className="text-xl font-bold">
                      {mentor.average_rating?.toFixed(1) || 'New'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Rating</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-blue-50">
                  <div className="flex items-center justify-center gap-1 text-blue-600">
                    <Users className="w-5 h-5" />
                    <span className="text-xl font-bold">{mentor.total_reviews}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Reviews</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-teal-50">
                  <div className="flex items-center justify-center gap-1 text-teal-600">
                    <Calendar className="w-5 h-5" />
                    <span className="text-xl font-bold">{mentor.experience_years}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Years Exp.</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-rose-50">
                  <div className="flex items-center justify-center gap-1 text-rose-600">
                    <Clock className="w-5 h-5" />
                    <span className="text-xl font-bold">{mentor.response_time_hours}h</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Response</p>
                </div>
              </div>
            </div>

            <div className="md:text-right">
              <Button className="bg-teal-600 hover:bg-teal-700 w-full md:w-auto" asChild>
                <Link to={`/mentors/${id}/request`}>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Request Mentorship
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* About */}
          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">
                {mentor.bio || `${mentor.profile?.full_name} is a ${mentor.experience_years}-year experienced coach in ${(Array.isArray(mentor.expertise) ? mentor.expertise.join(', ') : '')}.`}
              </p>
              {mentor.training_philosophy && (
                <>
                  <Separator className="my-4" />
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Training Philosophy</h4>
                    <p className="text-gray-600">{mentor.training_philosophy}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Certifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                Certifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              {Array.isArray(mentor.certifications) && mentor.certifications.length > 0 ? (
                <div className="space-y-3">
                  {mentor.certifications.map((cert: any, i: number) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-teal-600" />
                        <div>
                          <p className="font-medium">{cert.name}</p>
                          <p className="text-sm text-gray-500">
                            {cert.issuer} - {cert.year}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : typeof mentor.certifications === 'object' && mentor.certifications !== null ? (
                <div className="p-4 rounded-lg bg-gray-50 space-y-2 border">
                  <p className="font-semibold text-sm text-teal-800">
                    Verification Level: {(mentor.certifications as any).level || 'Verified'}
                  </p>
                  {Array.isArray((mentor.certifications as any).certifications) && (
                    <div className="flex flex-wrap gap-2 mt-1">
                      {((mentor.certifications as any).certifications as string[]).map((c, idx) => (
                        <Badge key={idx} variant="outline" className="bg-teal-50 text-teal-700 border-teal-200">
                          {c}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Certifications pending verification</p>
              )}
            </CardContent>
          </Card>

          {/* Reviews */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5" />
                Reviews & Ratings
              </CardTitle>
              <CardDescription>What athletes say about this mentor</CardDescription>
            </CardHeader>
            <CardContent>
              {reviewsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-24 rounded-lg" />
                  ))}
                </div>
              ) : reviews && reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="p-4 rounded-lg border">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= Math.round(
                                  (review.respectful +
                                    review.helpful +
                                    review.knowledgeable +
                                    review.safe_communication +
                                    review.punctual) /
                                    5
                                )
                                  ? 'text-amber-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-gray-500">
                          {format(new Date(review.created_at), 'MMM d, yyyy')}
                        </p>
                      </div>
                      {review.comment && (
                        <p className="mt-3 text-gray-700">{review.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No reviews yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Languages */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Globe className="w-4 h-4" />
                Languages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {mentor.languages.map((lang) => (
                  <Badge key={lang} variant="outline">
                    {lang}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Availability */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="w-4 h-4" />
                Availability
              </CardTitle>
            </CardHeader>
            <CardContent>
              {mentor.availability && mentor.availability.length > 0 ? (
                <div className="space-y-2">
                  {mentor.availability.map((slot) => (
                    <div key={slot} className="text-sm text-gray-600">
                      {slot}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">Available for online sessions</p>
              )}
            </CardContent>
          </Card>

          {/* Rating Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Rating Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {ratingCategories.map((cat) => (
                <div key={cat.label}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600">{cat.label}</span>
                    <span className="font-medium">{cat.value.toFixed(1)}/5</span>
                  </div>
                  <Progress value={(cat.value / 5) * 100} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Safety Info */}
          <Card className="bg-teal-50 border-teal-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-teal-800">
                <Shield className="w-5 h-5" />
                <span className="font-medium">Safety First</span>
              </div>
              <p className="text-sm text-teal-700 mt-2">
                This mentor is verified and has signed our code of conduct. All conversations are
                monitored for safety.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Shield,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  AlertCircle,
} from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { signIn, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || null;

  const getDashboardPath = () => {
    switch (profile?.role) {
      case 'ATHLETE':
      case 'SPONSOR':
      case 'COLLEGE_REP':
        return '/dashboard/athlete';
      case 'MENTOR':
        return '/dashboard/mentor';
      case 'GUARDIAN':
        return '/dashboard/guardian';
      case 'ADMIN':
        return '/dashboard/admin';
      default:
        return '/dashboard/athlete';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const startTime = performance.now();
    console.log("--- Starting Login Performance Measurement ---");

    try {
      const result = await signIn(email, password);
      const authTime = performance.now();
      console.log(`[Performance] Supabase Auth + Profile Fetch took: ${(authTime - startTime).toFixed(2)}ms`);

      if (result.error) {
        setError(result.error.message);
      } else {
        const routeTime = performance.now();
        console.log(`[Performance] Navigation initialization took: ${(routeTime - authTime).toFixed(2)}ms`);
        console.log(`[Performance] Total login flow took: ${(routeTime - startTime).toFixed(2)}ms`);
        navigate(from || getDashboardPath(), { replace: true });
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-amber-50 flex flex-col">
      {/* Header */}
      <header className="p-4 sm:p-6">
        <Link to="/" className="flex items-center gap-2 w-fit">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-600 to-teal-800 flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-xl">S</span>
          </div>
          <span className="font-bold text-teal-900 text-xl">SHAKTHI</span>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <Card className="border-0 shadow-xl">
            <CardHeader className="space-y-1 text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-teal-100 to-teal-200 flex items-center justify-center mb-4">
                <Shield className="w-8 h-8 text-teal-700" />
              </div>
              <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
              <CardDescription>
                Sign in to continue your sports journey
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link
                      to="/forgot-password"
                      className="text-xs text-teal-600 hover:text-teal-700 hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-teal-600 hover:bg-teal-700"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </>
                  )}
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-muted-foreground">Or</span>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-center text-sm text-gray-600">
                  Sign in as:
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  <Badge
                    variant="outline"
                    className="cursor-pointer hover:bg-teal-50"
                    onClick={() => {
                      setEmail('athlete@shakthi.org');
                      setPassword('password123');
                    }}
                  >
                    Athlete
                  </Badge>
                  <Badge
                    variant="outline"
                    className="cursor-pointer hover:bg-teal-50"
                    onClick={() => {
                      setEmail('mentor@shakthi.org');
                      setPassword('password123');
                    }}
                  >
                    Mentor
                  </Badge>
                  <Badge
                    variant="outline"
                    className="cursor-pointer hover:bg-teal-50"
                    onClick={() => {
                      setEmail('guardian@shakthi.org');
                      setPassword('password123');
                    }}
                  >
                    Guardian
                  </Badge>
                  <Badge
                    variant="outline"
                    className="cursor-pointer hover:bg-teal-50"
                    onClick={() => {
                      setEmail('college1@shakthi.org');
                      setPassword('password123');
                    }}
                  >
                    College
                  </Badge>
                  <Badge
                    variant="outline"
                    className="cursor-pointer hover:bg-teal-50"
                    onClick={() => {
                      setEmail('sponsor@shakthi.org');
                      setPassword('password123');
                    }}
                  >
                    Sponsor
                  </Badge>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-4">
              <div className="text-center text-sm text-gray-600">
                Don&apos;t have an account?{' '}
                <Link to="/signup" className="font-medium text-teal-600 hover:text-teal-700 hover:underline">
                  Sign up free
                </Link>
              </div>
            </CardFooter>
          </Card>

          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500 flex items-center justify-center gap-2">
              <Shield className="w-3 h-3" />
              Your data is protected with end-to-end encryption
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Shield,
  User,
  Users,
  Heart,
  Building,
  Award,
  ArrowRight,
  Loader2,
  AlertCircle,
  CheckCircle,
  Mail,
  Lock,
  Phone,
  Eye,
  EyeOff,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const roles = [
  {
    value: 'ATHLETE',
    label: 'Athlete',
    description: 'I am a sportsperson looking for mentors and opportunities',
    icon: User,
    color: 'bg-teal-50 border-teal-200 text-teal-700',
    selectedColor: 'bg-teal-100 border-teal-500 text-teal-800',
  },
  {
    value: 'MENTOR',
    label: 'Mentor',
    description: 'I want to guide and support upcoming athletes',
    icon: Users,
    color: 'bg-blue-50 border-blue-200 text-blue-700',
    selectedColor: 'bg-blue-100 border-blue-500 text-blue-800',
  },
  {
    value: 'GUARDIAN',
    label: 'Parent/Guardian',
    description: 'I want to support and monitor my child\'s sports journey',
    icon: Heart,
    color: 'bg-rose-50 border-rose-200 text-rose-700',
    selectedColor: 'bg-rose-100 border-rose-500 text-rose-800',
  },
  {
    value: 'COLLEGE_REP',
    label: 'College Rep',
    description: 'I represent a college with sports quota',
    icon: Building,
    color: 'bg-amber-50 border-amber-200 text-amber-700',
    selectedColor: 'bg-amber-100 border-amber-500 text-amber-800',
  },
  {
    value: 'SPONSOR',
    label: 'Sponsor',
    description: 'I want to support athletes through scholarships',
    icon: Award,
    color: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    selectedColor: 'bg-emerald-100 border-emerald-500 text-emerald-800',
  },
];

export default function SignupPage() {
  const [selectedRole, setSelectedRole] = useState<string | null>('ATHLETE');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signUp, user, isOnboarded, profile } = useAuth();

  useEffect(() => {
    if (user) {
      if (isOnboarded) {
        switch (profile?.role) {
          case 'ATHLETE':
            navigate('/dashboard/athlete');
            break;
          case 'MENTOR':
            navigate('/dashboard/mentor');
            break;
          case 'GUARDIAN':
            navigate('/dashboard/guardian');
            break;
          case 'SPONSOR':
            navigate('/dashboard/sponsor');
            break;
          case 'COLLEGE_REP':
            navigate('/dashboard/college');
            break;
          case 'ADMIN':
            navigate('/dashboard/admin');
            break;
          default:
            navigate('/dashboard/athlete');
        }
      } else if (profile?.role) {
        switch (profile.role) {
          case 'ATHLETE':
            navigate('/signup/athlete');
            break;
          case 'MENTOR':
            navigate('/signup/mentor');
            break;
          case 'GUARDIAN':
            navigate('/signup/guardian');
            break;
        }
      }
    }
  }, [user, isOnboarded, profile, navigate]);

  if (user && (isOnboarded || profile?.role)) {
    return null;
  }

  const validateForm = () => {
    if (!selectedRole) {
      setError('Please select a role to continue');
      return false;
    }
    if (!fullName.trim()) {
      setError('Please enter your full name');
      return false;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address');
      return false;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) return;

    setLoading(true);

    try {
      const result = await signUp(email, password, fullName, selectedRole!, phone);
      if (result.error) {
        setError(result.error.message);
      } else {
        // Navigate to appropriate onboarding
        switch (selectedRole) {
          case 'ATHLETE':
            navigate('/signup/athlete');
            break;
          case 'MENTOR':
            navigate('/signup/mentor');
            break;
          case 'GUARDIAN':
            navigate('/signup/guardian');
            break;
          default:
            navigate('/dashboard/athlete');
        }
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
        <div className="w-full max-w-lg">
          <Card className="border-0 shadow-xl">
            <CardHeader className="space-y-1 text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-teal-100 to-teal-200 flex items-center justify-center mb-4">
                <Shield className="w-8 h-8 text-teal-700" />
              </div>
              <CardTitle className="text-2xl font-bold">Create Your Account</CardTitle>
              <CardDescription>
                Join thousands of athletes on their journey to excellence
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Role Selection */}
              <div className="space-y-3">
                <Label>I am a...</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {roles.map((role) => (
                    <button
                      key={role.value}
                      type="button"
                      onClick={() => setSelectedRole(role.value)}
                      className={cn(
                        'flex items-start gap-3 p-3 rounded-xl border-2 transition-all text-left w-full',
                        selectedRole === role.value
                          ? role.selectedColor
                          : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                      )}
                    >
                      <role.icon className="w-5 h-5 mt-0.5 shrink-0" />
                      <div>
                        <p className="font-medium text-sm">{role.label}</p>
                        <p className="text-xs opacity-80 mt-0.5">{role.description}</p>
                      </div>
                      {selectedRole === role.value && (
                        <CheckCircle className="w-4 h-4 ml-auto shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Registration Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>

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
                  <Label htmlFor="phone">Phone Number (Optional)</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+91 9876543210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Create Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="At least 8 characters"
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

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Re-enter password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-start gap-2 text-sm text-gray-600">
                  <Shield className="w-4 h-4 text-teal-600 mt-0.5 shrink-0" />
                  <p>
                    By signing up, you agree to our Terms of Service and Privacy Policy. Your data
                    is protected and never shared without consent.
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-teal-600 hover:bg-teal-700"
                  disabled={loading || !selectedRole}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    <>
                      Create Account
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>

            <CardFooter className="flex flex-col gap-2">
              <div className="text-center text-sm text-gray-600">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="font-medium text-teal-600 hover:text-teal-700 hover:underline"
                >
                  Sign in
                </Link>
              </div>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
}

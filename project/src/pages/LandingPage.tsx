import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Shield,
  Users,
  Award,
  GraduationCap,
  Heart,
  Star,
  ArrowRight,
  CheckCircle,
  Globe,
  Lock,
  MessageSquare,
  Trophy,
  Target,
  Sparkles,
  ChevronRight,
  Quote,
} from 'lucide-react';

// ===== WORKING IMAGES - All Unsplash (Guaranteed to Work) =====
const IMAGES = {
  // Testimonial/Profile Images
  testimonial1: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=150&h=150&fit=crop&crop=face',
  testimonial2: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=150&h=150&fit=crop&crop=face',
  testimonial3: 'https://images.unsplash.com/photo-1515524738708-327f6b0037a7?w=150&h=150&fit=crop&crop=face',

  // Hero/Feature Images
  hero: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&h=500&fit=crop',
  athlete: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=500&fit=crop',
  sports: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=800&h=500&fit=crop',
  training: 'https://images.unsplash.com/photo-1515524738708-327f6b0037a7?w=800&h=500&fit=crop',

  // Avatar placeholders for the hero section
  avatar1: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=100&h=100&fit=crop&crop=face',
  avatar2: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=100&h=100&fit=crop&crop=face',
  avatar3: 'https://images.unsplash.com/photo-1515524738708-327f6b0037a7?w=100&h=100&fit=crop&crop=face',
  avatar4: 'https://images.unsplash.com/photo-1553456558-9e78b7d2b4c1?w=100&h=100&fit=crop&crop=face',

  // Default fallback
  default: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&h=400&fit=crop',
};

const features = [
  {
    icon: Shield,
    title: 'Safety-First Platform',
    description:
      'Every mentor is verified. All chats are guardian-visible. Report misconduct instantly with 24/7 support.',
    color: 'bg-rose-50 text-rose-600',
  },
  {
    icon: Users,
    title: 'Verified Mentors',
    description:
      'Connect with certified coaches, sports psychologists, and experienced athletes from across India.',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    icon: Award,
    title: 'Scholarship Discovery',
    description:
      'AI-powered matching to find scholarships perfect for you - women-focused, rural-friendly opportunities.',
    color: 'bg-amber-50 text-amber-600',
  },
  {
    icon: GraduationCap,
    title: 'Sports Quota Colleges',
    description:
      'Find colleges with sports quotas, fee concessions, and dedicated women athlete support.',
    color: 'bg-emerald-50 text-emerald-600',
  },
  {
    icon: Heart,
    title: 'Guardian Involvement',
    description:
      'Parents stay informed. Approve mentor connections. Monitor chats for minor athletes.',
    color: 'bg-purple-50 text-purple-600',
  },
  {
    icon: Star,
    title: 'Recognition & Badges',
    description:
      'Earn badges for achievements. Get featured on our Champions Wall. Inspire other athletes.',
    color: 'bg-teal-50 text-teal-600',
  },
];

const testimonials = [
  {
    name: 'Priya Sharma',
    role: 'Kabaddi Player, Haryana',
    content:
      'Through SHAKTHI, I found a mentor who helped me get selected for the state team. Now I have a scholarship worth Rs 2 lakh!',
    image: IMAGES.testimonial1,
    achievement: 'State Level Medalist',
  },
  {
    name: 'Kavita Patel',
    role: 'Athletics, Maharashtra',
    content:
      'As a rural athlete, I never had access to proper training guidance. SHAKTHI connected me with a certified coach who understood my challenges.',
    image: IMAGES.testimonial2,
    achievement: 'National Level Participant',
  },
  {
    name: 'Sunita Devi',
    role: 'Kho-Kho Player, Odisha',
    content:
      'My parents were hesitant about sports. SHAKTHI\'s guardian features made them feel safe. Now they actively support my journey.',
    image: IMAGES.testimonial3,
    achievement: 'District Champion',
  },
];

const stats = [
  { value: '5,000+', label: 'Athletes' },
  { value: '500+', label: 'Verified Mentors' },
  { value: '200+', label: 'Scholarships' },
  { value: '50+', label: 'Partner Colleges' },
];

const faqs = [
  {
    question: 'Is SHAKTHI free for athletes?',
    answer:
      'Yes! SHAKTHI is completely free for athletes. We believe every talented girl deserves access to mentorship and opportunities, regardless of financial background.',
  },
  {
    question: 'How are mentors verified?',
    answer:
      'Every mentor undergoes a thorough verification process: ID verification, qualifications check, experience validation, and reference verification. Mentors also sign a strict code of conduct.',
  },
  {
    question: 'What does guardian visibility mean?',
    answer:
      'For athletes under 18, parents/guardians can view chat conversations between their child and mentors. This ensures transparency and safety while maintaining mentorship quality.',
  },
  {
    question: 'How does the report system work?',
    answer:
      'If you experience any misconduct, you can report it instantly through the app. Reports are prioritized by severity and handled within 24-48 hours. You can report anonymously if needed.',
  },
  {
    question: 'Can I trust the scholarship information?',
    answer:
      'All scholarship listings are verified before being published. We source from government sports departments, recognized foundations, and accredited institutions.',
  },
  {
    question: 'What sports are supported?',
    answer:
      'SHAKTHI supports all sports - from popular ones like Athletics, Badminton, Cricket to indigenous sports like Kabaddi, Kho-Kho, and Wrestling. We also support para-sports athletes.',
  },
];

export default function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 via-white to-amber-50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-teal-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-600 to-teal-800 flex items-center justify-center shadow-lg shadow-teal-200">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <div>
                <h1 className="font-bold text-teal-900 text-xl tracking-tight">SHAKTHI</h1>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-600 hover:text-teal-700 transition-colors">
                Features
              </a>
              <a href="#how-it-works" className="text-gray-600 hover:text-teal-700 transition-colors">
                How It Works
              </a>
              <a href="#testimonials" className="text-gray-600 hover:text-teal-700 transition-colors">
                Success Stories
              </a>
              <a href="#faq" className="text-gray-600 hover:text-teal-700 transition-colors">
                FAQ
              </a>
            </nav>

            <div className="flex items-center gap-3">
              {user ? (
                <Button asChild className="bg-teal-600 hover:bg-teal-700">
                  <Link to="/dashboard">Dashboard</Link>
                </Button>
              ) : (
                <>
                  <Button variant="ghost" asChild className="hidden sm:flex">
                    <Link to="/login">Sign In</Link>
                  </Button>
                  <Button asChild className="bg-teal-600 hover:bg-teal-700">
                    <Link to="/signup">Get Started</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 rounded-full text-amber-800 text-sm font-medium">
                <Sparkles className="w-4 h-4" />
                <span>Safety-First Sports Platform</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Empowering Rural{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-teal-700">
                  Girl Athletes
                </span>{' '}
                Across India
              </h1>

              <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">
                Connect with verified mentors, discover scholarships, find sports quota colleges,
                and grow with dignity — all in a <strong className="text-teal-700">safe,
                  guardian-supported environment</strong>.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  asChild
                  size="lg"
                  className="bg-teal-600 hover:bg-teal-700 text-lg px-8 py-6 shadow-lg shadow-teal-200"
                >
                  <Link to="/signup">
                    Start Your Journey
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="text-lg px-8 py-6 border-teal-200 text-teal-700 hover:bg-teal-50"
                >
                  <a href="#how-it-works">Learn More</a>
                </Button>
              </div>

              <div className="flex items-center gap-6 pt-4">
                <div className="flex -space-x-3">
                  <div className="w-10 h-10 rounded-full border-2 border-white overflow-hidden">
                    <img src={IMAGES.avatar1} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="w-10 h-10 rounded-full border-2 border-white overflow-hidden">
                    <img src={IMAGES.avatar2} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="w-10 h-10 rounded-full border-2 border-white overflow-hidden">
                    <img src={IMAGES.avatar3} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="w-10 h-10 rounded-full border-2 border-white overflow-hidden">
                    <img src={IMAGES.avatar4} alt="" className="w-full h-full object-cover" />
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-900">5,000+</span> athletes already
                  growing with SHAKTHI
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-teal-200 to-amber-200 rounded-3xl blur-2xl opacity-30" />
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src={IMAGES.hero}
                  alt="Young girl athlete in sports uniform ready to compete"
                  className="w-full h-[500px] object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="bg-white/95 backdrop-blur rounded-2xl p-4 shadow-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                        <Shield className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">100% Verified Mentors</p>
                        <p className="text-sm text-gray-500">Background-checked professionals</p>
                      </div>
                      <CheckCircle className="w-6 h-6 text-teal-500 ml-auto" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute -top-6 -right-6 bg-white rounded-2xl p-4 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">200+</p>
                    <p className="text-xs text-gray-500">Scholarships Listed</p>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl p-4 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                    <Lock className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">24/7</p>
                    <p className="text-xs text-gray-500">Safety Support</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-teal-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-4xl font-bold text-white">{stat.value}</p>
                <p className="text-teal-200 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge className="bg-teal-100 text-teal-800 mb-4">Features</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Grow
            </h2>
            <p className="text-lg text-gray-600">
              A comprehensive platform designed with safety, accessibility, and your dreams in mind.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <Card
                key={i}
                className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group"
              >
                <CardContent className="p-6">
                  <div
                    className={`w-14 h-14 rounded-2xl ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                  >
                    <feature.icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-teal-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge className="bg-amber-100 text-amber-800 mb-4">How It Works</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Your Journey in 4 Steps
            </h2>
            <p className="text-lg text-gray-600">
              Getting started is easy. Sign up, build your sports profile, and connect with
              opportunities.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: '01',
                title: 'Create Profile',
                description: 'Sign up and tell us about your sport, achievements, and goals.',
                icon: Target,
              },
              {
                step: '02',
                title: 'Get Verified',
                description: 'Add your guardian details for a protected experience.',
                icon: Shield,
              },
              {
                step: '03',
                title: 'Connect & Learn',
                description: 'Find mentors, save scholarships, access training resources.',
                icon: MessageSquare,
              },
              {
                step: '04',
                title: 'Grow & Achieve',
                description: 'Track progress, earn badges, share your success story.',
                icon: Trophy,
              },
            ].map((item, i) => (
              <div key={i} className="relative">
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                  <div className="text-5xl font-bold text-teal-100 mb-4">{item.step}</div>
                  <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center mb-4">
                    <item.icon className="w-6 h-6 text-teal-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm">{item.description}</p>
                </div>
                {i < 3 && (
                  <ChevronRight className="hidden lg:block absolute top-1/2 -right-4 w-6 h-6 text-teal-300 transform -translate-y-1/2" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge className="bg-rose-100 text-rose-800 mb-4">Success Stories</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Athletes Like You Are Winning
            </h2>
            <p className="text-lg text-gray-600">
              Real stories from athletes who found mentors, scholarships, and success through
              SHAKTHI.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <Card key={i} className="bg-gradient-to-br from-teal-50 to-white border border-teal-100">
                <CardContent className="p-6">
                  <Quote className="w-10 h-10 text-teal-200 mb-4" />
                  <p className="text-gray-700 mb-6 leading-relaxed">&ldquo;{t.content}&rdquo;</p>
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-teal-200">
                      <img src={t.image} alt={t.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{t.name}</p>
                      <p className="text-sm text-gray-500">{t.role}</p>
                      <Badge variant="secondary" className="mt-1 bg-amber-100 text-amber-700">
                        {t.achievement}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-teal-700 to-teal-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-teal-100 mb-8">
            Join thousands of athletes finding mentors, scholarships, and opportunities.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="bg-white text-teal-700 hover:bg-gray-100 text-lg px-8 py-6"
            >
              <Link to="/signup">
                Sign Up Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-2 border-white text-white hover:bg-teal-600 text-lg px-8 py-6"
            >
              <Link to="/signup?role=mentor">Become a Mentor</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="bg-gray-200 text-gray-800 mb-4">FAQ</Badge>
            <h2 className="text-3xl font-bold text-gray-900">Frequently Asked Questions</h2>
          </div>

          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="bg-white rounded-xl px-6 shadow-sm border-0"
              >
                <AccordionTrigger className="hover:no-underline py-4 text-left font-medium">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pb-4">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center">
                  <span className="text-white font-bold text-xl">S</span>
                </div>
                <span className="font-bold text-white text-xl">SHAKTHI</span>
              </div>
              <p className="text-gray-400 max-w-sm">
                A safety-first sports empowerment platform for rural girl athletes across India.
                Built with love and a commitment to dignity.
              </p>
              <div className="flex items-center gap-2 mt-4 text-teal-400">
                <Shield className="w-4 h-4" />
                <span className="text-sm">Your safety is our priority</span>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/signup" className="hover:text-teal-400 transition-colors">
                    Sign Up
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="hover:text-teal-400 transition-colors">
                    Sign In
                  </Link>
                </li>
                <li>
                  <a href="#features" className="hover:text-teal-400 transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#faq" className="hover:text-teal-400 transition-colors">
                    FAQ
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Safety & Support</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/safety" className="hover:text-teal-400 transition-colors">
                    Safety Center
                  </Link>
                </li>
                <li>
                  <Link to="/help" className="hover:text-teal-400 transition-colors">
                    Help & Support
                  </Link>
                </li>
                <li>
                  <a href="#" className="hover:text-teal-400 transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-teal-400 transition-colors">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm">
              © 2024 SHAKTHI. Made with{' '}
              <Heart className="w-4 h-4 inline text-rose-500" /> for Indian athletes.
            </p>
            <div className="flex items-center gap-4">
              <Globe className="w-4 h-4" />
              <span className="text-sm">Available in 10 Indian languages</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
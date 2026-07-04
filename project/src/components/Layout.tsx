import { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { getUnreadNotificationCount } from '@/services/api';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Home,
  Users,
  Award,
  GraduationCap,
  Calendar,
  BookOpen,
  Shield,
  MessageSquare,
  Bell,
  Settings,
  LogOut,
  HelpCircle,
  Menu,
  ChevronDown,
  Trophy,
  Building,
  BarChart3,
  Sparkles,
} from 'lucide-react';
import { ROLE_LABELS } from '@/constants/theme';

interface LayoutProps {
  children: ReactNode;
}

const athleteNavItems = [
  { label: 'Dashboard', icon: Home, path: '/dashboard/athlete' },
  { label: 'Find Mentors', icon: Users, path: '/mentors' },
  { label: 'Scholarships', icon: Award, path: '/scholarships' },
  { label: 'Colleges', icon: GraduationCap, path: '/colleges' },
  { label: 'Opportunities', icon: Calendar, path: '/opportunities' },
  { label: 'Training', icon: BookOpen, path: '/training' },
  { label: 'Safety', icon: Shield, path: '/safety' },
  { label: 'Chat', icon: MessageSquare, path: '/chat' },
  { label: 'Success Stories', icon: Trophy, path: '/stories' },
];


const mentorNavItems = [
  { label: 'Dashboard', icon: Home, path: '/dashboard/mentor' },
  { label: 'My Athletes', icon: Users, path: '/mentors/my-athletes' },
  { label: 'Chat', icon: MessageSquare, path: '/chat' },
  { label: 'Safety', icon: Shield, path: '/safety' },
  { label: 'Training Resources', icon: BookOpen, path: '/training' },
];

const guardianNavItems = [
  { label: 'Dashboard', icon: Home, path: '/dashboard/guardian' },
  { label: 'Chat Monitor', icon: MessageSquare, path: '/chat' },
  { label: 'Safety', icon: Shield, path: '/safety' },
  { label: 'Settings', icon: Settings, path: '/settings' },
];

const adminNavItems = [
  { label: 'Dashboard', icon: Home, path: '/dashboard/admin' },
  { label: 'Mentor Verification', icon: Users, path: '/admin/mentor-verification' },
  { label: 'Safety Reports', icon: Shield, path: '/admin/safety-reports' },
  { label: 'Colleges', icon: Building, path: '/colleges' },
  { label: 'Opportunities', icon: Calendar, path: '/opportunities' },
  { label: 'Analytics', icon: BarChart3, path: '/admin/analytics' },
];

export default function Layout({ children }: LayoutProps) {
  const { profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['unreadNotifications', profile?.id],
    queryFn: () => (profile ? getUnreadNotificationCount(profile.id) : 0),
    enabled: !!profile,
    refetchInterval: 30000,
  });

  const navItems =
    profile?.role === 'ADMIN'
      ? adminNavItems
      : profile?.role === 'MENTOR'
        ? mentorNavItems
        : profile?.role === 'GUARDIAN'
          ? guardianNavItems
          : athleteNavItems;

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const NavContent = () => (
    <nav className="flex flex-col h-full">
      <div className="p-4 border-b border-teal-100">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-600 to-teal-800 flex items-center justify-center">
            <span className="text-white font-bold text-lg">S</span>
          </div>
          <div>
            <h1 className="font-bold text-teal-900 text-lg">SHAKTHI</h1>
            <p className="text-xs text-teal-600">Empowering Athletes</p>
          </div>
        </Link>
      </div>

      <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all',
                isActive
                  ? 'bg-teal-100 text-teal-900 font-medium'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              )}
            >
              <item.icon className={cn('w-5 h-5', isActive && 'text-teal-600')} />
              <span>{item.label}</span>
              {item.label === 'Chat' && (
                <Badge variant="secondary" className="ml-auto h-5 px-2 text-xs">
                  {unreadCount}
                </Badge>
              )}
            </Link>
          );
        })}
      </div>

      <Separator />

      <div className="p-3 space-y-1">
        <Link
          to="/notifications"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all"
        >
          <Bell className="w-5 h-5" />
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Badge className="ml-auto bg-amber-500 h-5 px-2 text-xs text-white">
              {unreadCount}
            </Badge>
          )}
        </Link>
        <Link
          to="/help"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all"
        >
          <HelpCircle className="w-5 h-5" />
          <span>Help & Support</span>
        </Link>
        <Link
          to="/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all"
        >
          <Settings className="w-5 h-5" />
          <span>Settings</span>
        </Link>
      </div>
    </nav>
  );

  const bottomNavItems = navItems.slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col bg-white border-r border-gray-200 shadow-sm">
        <NavContent />
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-4 h-16">
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-teal-700">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <NavContent />
            </SheetContent>
          </Sheet>

          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-600 to-teal-800 flex items-center justify-center">
              <span className="text-white font-bold">S</span>
            </div>
            <span className="font-bold text-teal-900">SHAKTHI</span>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5 text-gray-600" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 rounded-full text-white text-xs flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/notifications')}>
                View Notifications
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/settings')}>
                Settings
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Main Content */}
      <main className="lg:pl-64 pb-20 lg:pb-0">
        <div className="pt-16 lg:pt-0">
          {/* Desktop Top Bar */}
          <header className="hidden lg:flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Welcome, {profile?.full_name?.split(' ')[0]}
              </h2>
              <p className="text-sm text-gray-500">
                {ROLE_LABELS[profile?.role || 'ATHLETE']}
                {profile?.verified && (
                  <span className="ml-2 inline-flex items-center gap-1 text-teal-600">
                    <Shield className="w-4 h-4" /> Verified
                  </span>
                )}
              </p>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-3 px-3 py-2">
                  <Avatar className="w-9 h-9">
                    <AvatarImage src={profile?.avatar_url} />
                    <AvatarFallback className="bg-teal-600 text-white">
                      {getInitials(profile?.full_name || 'U')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-left">
                    <p className="text-sm font-medium">{profile?.full_name}</p>
                    <p className="text-xs text-gray-500">{ROLE_LABELS[profile?.role || 'ATHLETE']}</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/settings')}>
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/help')}>
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Help & Support
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </header>

          <div className="p-4 lg:p-6">{children}</div>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 safe-area-padding-bottom">
        <div className="flex items-center justify-around py-2">
          {bottomNavItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex flex-col items-center gap-1 px-3 py-1',
                  isActive ? 'text-teal-600' : 'text-gray-500'
                )}
              >
                <item.icon className={cn('w-5 h-5', isActive && 'text-teal-600')} />
                <span className="text-xs">{item.label}</span>
              </Link>
            );
          })}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex flex-col items-center gap-1 px-3 py-1 text-gray-500">
                <Menu className="w-5 h-5" />
                <span className="text-xs">More</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 mb-2">
              {navItems.slice(5).map((item) => (
                <DropdownMenuItem key={item.path} onClick={() => navigate(item.path)}>
                  <item.icon className="w-4 h-4 mr-2" />
                  {item.label}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>
    </div>
  );
}

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';

// Pages
import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/auth/LoginPage';
import SignupPage from '@/pages/auth/SignupPage';
import AthleteOnboardingPage from '@/pages/onboarding/AthleteOnboardingPage';
import MentorOnboardingPage from '@/pages/onboarding/MentorOnboardingPage';
import GuardianOnboardingPage from '@/pages/onboarding/GuardianOnboardingPage';
import AthleteDashboard from '@/pages/athlete/AthleteDashboard';
import MentorDashboard from '@/pages/mentor/MentorDashboard';
import MyAthletesPage from '@/pages/mentor/MyAthletesPage';
import MentorProfilePage from '@/pages/mentor/MentorProfilePage';
import GuardianDashboard from '@/pages/guardian/GuardianDashboard';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import MentorDiscoveryPage from '@/pages/mentors/MentorDiscoveryPage';
import MentorDetailPage from '@/pages/mentors/MentorDetailPage';
import RequestMentorshipPage from '@/pages/mentors/RequestMentorshipPage';
import ScholarshipsPage from '@/pages/scholarships/ScholarshipsPage';
import ScholarshipDetailPage from '@/pages/scholarships/ScholarshipDetailPage';
import SavedScholarshipsPage from '@/pages/scholarships/SavedScholarshipsPage';
import CollegesPage from '@/pages/colleges/CollegesPage';
import CollegeDetailPage from '@/pages/colleges/CollegeDetailPage';
import CollegeComparePage from '@/pages/colleges/CollegeComparePage';
import OpportunitiesPage from '@/pages/opportunities/OpportunitiesPage';
import OpportunityDetailPage from '@/pages/opportunities/OpportunityDetailPage';
import TrainingCenterPage from '@/pages/training/TrainingCenterPage';
import TrainingResourcePage from '@/pages/training/TrainingResourcePage';
import SafetyCenterPage from '@/pages/safety/SafetyCenterPage';
import ReportIssuePage from '@/pages/safety/ReportIssuePage';
import ReportStatusPage from '@/pages/safety/ReportStatusPage';
import ChatPage from '@/pages/chat/ChatPage';
import NotificationsPage from '@/pages/NotificationsPage';
import SettingsPage from '@/pages/SettingsPage';
import HelpPage from '@/pages/HelpPage';
import AthleteProfilePage from '@/pages/athlete/AthleteProfilePage';
import SuccessStoriesPage from '@/pages/SuccessStoriesPage';
import SponsorDashboard from '@/pages/sponsor/SponsorDashboard';
import CollegeRepDashboard from '@/pages/college/CollegeRepDashboard';

// Components
import ProtectedRoute from '@/components/ProtectedRoute';
import Layout from '@/components/Layout';
import { ReactNode } from 'react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

// Dashboard router component
function DashboardRouter() {
  const { profile } = useAuth();

  if (!profile) return null;

  switch (profile.role) {
    case 'ATHLETE':
      return <Navigate to="/dashboard/athlete" replace />;
    case 'MENTOR':
      return <Navigate to="/dashboard/mentor" replace />;
    case 'GUARDIAN':
      return <Navigate to="/dashboard/guardian" replace />;
    case 'ADMIN':
      return <Navigate to="/dashboard/admin" replace />;
    case 'SPONSOR':
      return <Navigate to="/dashboard/sponsor" replace />;
    case 'COLLEGE_REP':
      return <Navigate to="/dashboard/college" replace />;
    default:
      return <Navigate to="/dashboard/athlete" replace />;
  }
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light">
        <AuthProvider>
          <Router>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route
                path="/signup/athlete"
                element={
                  <ProtectedRoute allowedRoles={['ATHLETE']}>
                    <AthleteOnboardingPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/signup/mentor"
                element={
                  <ProtectedRoute allowedRoles={['MENTOR']}>
                    <MentorOnboardingPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/signup/guardian"
                element={
                  <ProtectedRoute allowedRoles={['GUARDIAN']}>
                    <GuardianOnboardingPage />
                  </ProtectedRoute>
                }
              />

              {/* Protected Dashboard Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <DashboardRouter />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/athlete"
                element={
                  <ProtectedRoute allowedRoles={['ATHLETE', 'SPONSOR', 'COLLEGE_REP']}>
                    <Layout>
                      <AthleteDashboard />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/mentor"
                element={
                  <ProtectedRoute allowedRoles={['MENTOR']}>
                    <Layout>
                      <MentorDashboard />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/guardian"
                element={
                  <ProtectedRoute allowedRoles={['GUARDIAN']}>
                    <Layout>
                      <GuardianDashboard />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/admin"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <Layout>
                      <AdminDashboard />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/sponsor"
                element={
                  <ProtectedRoute allowedRoles={['SPONSOR']}>
                    <Layout>
                      <SponsorDashboard />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/college"
                element={
                  <ProtectedRoute allowedRoles={['COLLEGE_REP']}>
                    <Layout>
                      <CollegeRepDashboard />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              {/* Protected Routes with Layout */}
              <Route
                path="/athlete/profile"
                element={
                  <ProtectedRoute allowedRoles={['ATHLETE']}>
                    <Layout>
                      <AthleteProfilePage />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/mentors"
                element={
                  <ProtectedRoute allowedRoles={['ATHLETE', 'GUARDIAN', 'SPONSOR', 'COLLEGE_REP']}>
                    <Layout>
                      <MentorDiscoveryPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/mentors/my-athletes"
                element={
                  <ProtectedRoute allowedRoles={['MENTOR']}>
                    <Layout>
                      <MyAthletesPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/mentor/profile"
                element={
                  <ProtectedRoute allowedRoles={['MENTOR']}>
                    <Layout>
                      <MentorProfilePage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/mentors/:id"
                element={
                  <ProtectedRoute allowedRoles={['ATHLETE', 'GUARDIAN', 'MENTOR', 'SPONSOR', 'COLLEGE_REP']}>
                    <Layout>
                      <MentorDetailPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/mentors/:id/request"
                element={
                  <ProtectedRoute allowedRoles={['ATHLETE']}>
                    <Layout>
                      <RequestMentorshipPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/scholarships"
                element={
                  <ProtectedRoute allowedRoles={['ATHLETE', 'GUARDIAN', 'SPONSOR', 'COLLEGE_REP']}>
                    <Layout>
                      <ScholarshipsPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/scholarships/:id"
                element={
                  <ProtectedRoute allowedRoles={['ATHLETE', 'GUARDIAN', 'SPONSOR', 'COLLEGE_REP']}>
                    <Layout>
                      <ScholarshipDetailPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/scholarships/saved"
                element={
                  <ProtectedRoute allowedRoles={['ATHLETE', 'GUARDIAN', 'SPONSOR', 'COLLEGE_REP']}>
                    <Layout>
                      <SavedScholarshipsPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/colleges"
                element={
                  <ProtectedRoute allowedRoles={['ATHLETE', 'GUARDIAN', 'SPONSOR', 'COLLEGE_REP']}>
                    <Layout>
                      <CollegesPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/colleges/:id"
                element={
                  <ProtectedRoute allowedRoles={['ATHLETE', 'GUARDIAN', 'SPONSOR', 'COLLEGE_REP']}>
                    <Layout>
                      <CollegeDetailPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/colleges/compare"
                element={
                  <ProtectedRoute allowedRoles={['ATHLETE', 'GUARDIAN', 'SPONSOR', 'COLLEGE_REP']}>
                    <Layout>
                      <CollegeComparePage />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/opportunities"
                element={
                  <ProtectedRoute allowedRoles={['ATHLETE', 'GUARDIAN', 'SPONSOR', 'COLLEGE_REP']}>
                    <Layout>
                      <OpportunitiesPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/opportunities/:id"
                element={
                  <ProtectedRoute allowedRoles={['ATHLETE', 'GUARDIAN', 'SPONSOR', 'COLLEGE_REP']}>
                    <Layout>
                      <OpportunityDetailPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/training"
                element={
                  <ProtectedRoute allowedRoles={['ATHLETE', 'GUARDIAN', 'MENTOR', 'SPONSOR', 'COLLEGE_REP']}>
                    <Layout>
                      <TrainingCenterPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/training/:id"
                element={
                  <ProtectedRoute allowedRoles={['ATHLETE', 'GUARDIAN', 'MENTOR', 'SPONSOR', 'COLLEGE_REP']}>
                    <Layout>
                      <TrainingResourcePage />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/safety"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <SafetyCenterPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/safety/report"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <ReportIssuePage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/safety/report/status"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <ReportStatusPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/safety/report/:ticketId"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <ReportStatusPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/chat"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <ChatPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/chat/:threadId"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <ChatPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/notifications"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <NotificationsPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <SettingsPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/help"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <HelpPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/stories"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <SuccessStoriesPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Router>
          <Toaster position="top-right" />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;

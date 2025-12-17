import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';

// Contexts
import { useAuth } from './contexts/AuthContext';
import { useTheme } from './contexts/ThemeContext';

// Components
import LoadingSpinner from './components/ui/LoadingSpinner';
import ErrorBoundary from './components/ErrorBoundary';
import Layout from './components/Layout/Layout';

// Lazy load pages for better performance
const LoginPage = React.lazy(() => import('./pages/Auth/LoginPage'));
const RegisterPage = React.lazy(() => import('./pages/Auth/RegisterPage'));
const ForgotPasswordPage = React.lazy(() => import('./pages/Auth/ForgotPasswordPage'));
const ResetPasswordPage = React.lazy(() => import('./pages/Auth/ResetPasswordPage'));

const DashboardPage = React.lazy(() => import('./pages/Dashboard/DashboardPage'));
const RegulatoryPage = React.lazy(() => import('./pages/Regulatory/RegulatoryPage'));
const StandardsPage = React.lazy(() => import('./pages/Standards/StandardsPage'));
const AccreditationPage = React.lazy(() => import('./pages/Accreditation/AccreditationPage'));
const AlertsPage = React.lazy(() => import('./pages/Alerts/AlertsPage'));
const ReportsPage = React.lazy(() => import('./pages/Reports/ReportsPage'));
const DocumentsPage = React.lazy(() => import('./pages/Documents/DocumentsPage'));
const FacultyPage = React.lazy(() => import('./pages/Faculty/FacultyPage'));
const InstitutionsPage = React.lazy(() => import('./pages/Institutions/InstitutionsPage'));
const SettingsPage = React.lazy(() => import('./pages/Settings/SettingsPage'));
const ProfilePage = React.lazy(() => import('./pages/Profile/ProfilePage'));

const NotFoundPage = React.lazy(() => import('./pages/NotFoundPage'));
const Phase1Page = React.lazy(() => import('./pages/Phase1/Phase1Page'));

// Protected Route Component
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermissions?: string[];
  requiredRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermissions = [],
  requiredRoles = []
}) => {
  const { user, hasPermission, hasRole } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check permissions
  if (requiredPermissions.length > 0) {
    const hasRequiredPermission = requiredPermissions.some(permission => 
      hasPermission(permission)
    );
    
    if (!hasRequiredPermission) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // Check roles
  if (requiredRoles.length > 0) {
    const hasRequiredRole = requiredRoles.includes(user.role);
    
    if (!hasRequiredRole) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <>{children}</>;
};

// Public Route Component (redirect to dashboard if authenticated)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// App Routes Component
const AppRoutes: React.FC = () => {
  const { user, isLoading } = useAuth();
  const { theme } = useTheme();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Suspense fallback={<LoadingSpinner />}>
                <LoginPage />
              </Suspense>
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Suspense fallback={<LoadingSpinner />}>
                <RegisterPage />
              </Suspense>
            </PublicRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <PublicRoute>
              <Suspense fallback={<LoadingSpinner />}>
                <ForgotPasswordPage />
              </Suspense>
            </PublicRoute>
          }
        />
        <Route
          path="/reset-password"
          element={
            <PublicRoute>
              <Suspense fallback={<LoadingSpinner />}>
                <ResetPasswordPage />
              </Suspense>
            </PublicRoute>
          }
        />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          {/* Dashboard */}
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route
            path="dashboard"
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <DashboardPage />
              </Suspense>
            }
          />

          {/* Phase 1: Critical Penalty Avoidance Features */}
          <Route
            path="phase1"
            element={
              <ProtectedRoute requiredPermissions={['manage_compliance']}>
                <Suspense fallback={<LoadingSpinner />}>
                  <Phase1Page />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="risk-assessment"
            element={
              <ProtectedRoute requiredPermissions={['manage_compliance']}>
                <Suspense fallback={<LoadingSpinner />}>
                  <Phase1Page />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="critical-alerts"
            element={
              <ProtectedRoute requiredPermissions={['manage_compliance']}>
                <Suspense fallback={<LoadingSpinner />}>
                  <Phase1Page />
                </Suspense>
              </ProtectedRoute>
            }
          />

          {/* Regulatory Council */}
          <Route
            path="regulatory"
            element={
              <ProtectedRoute requiredPermissions={['view_regulatory']}>
                <Suspense fallback={<LoadingSpinner />}>
                  <RegulatoryPage />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="regulatory/approvals"
            element={
              <ProtectedRoute requiredPermissions={['manage_approvals']}>
                <Suspense fallback={<LoadingSpinner />}>
                  <RegulatoryPage />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="regulatory/documents"
            element={
              <ProtectedRoute requiredPermissions={['manage_documents']}>
                <Suspense fallback={<LoadingSpinner />}>
                  <DocumentsPage />
                </Suspense>
              </ProtectedRoute>
            }
          />

          {/* Standards Council */}
          <Route
            path="standards"
            element={
              <ProtectedRoute requiredPermissions={['view_standards']}>
                <Suspense fallback={<LoadingSpinner />}>
                  <StandardsPage />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="standards/curriculum"
            element={
              <ProtectedRoute requiredPermissions={['manage_curriculum']}>
                <Suspense fallback={<LoadingSpinner />}>
                  <StandardsPage />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="standards/faculty"
            element={
              <ProtectedRoute requiredPermissions={['manage_faculty']}>
                <Suspense fallback={<LoadingSpinner />}>
                  <FacultyPage />
                </Suspense>
              </ProtectedRoute>
            }
          />

          {/* Accreditation Council */}
          <Route
            path="accreditation"
            element={
              <ProtectedRoute requiredPermissions={['view_accreditation']}>
                <Suspense fallback={<LoadingSpinner />}>
                  <AccreditationPage />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="accreditation/readiness"
            element={
              <ProtectedRoute requiredPermissions={['manage_accreditation']}>
                <Suspense fallback={<LoadingSpinner />}>
                  <AccreditationPage />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="accreditation/audit"
            element={
              <ProtectedRoute requiredPermissions={['manage_audits']}>
                <Suspense fallback={<LoadingSpinner />}>
                  <AccreditationPage />
                </Suspense>
              </ProtectedRoute>
            }
          />

          {/* Cross-Council Features */}
          <Route
            path="alerts"
            element={
              <ProtectedRoute requiredPermissions={['manage_alerts']}>
                <Suspense fallback={<LoadingSpinner />}>
                  <AlertsPage />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="reports"
            element={
              <ProtectedRoute requiredPermissions={['generate_reports']}>
                <Suspense fallback={<LoadingSpinner />}>
                  <ReportsPage />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="documents"
            element={
              <ProtectedRoute requiredPermissions={['manage_documents']}>
                <Suspense fallback={<LoadingSpinner />}>
                  <DocumentsPage />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="faculty"
            element={
              <ProtectedRoute requiredPermissions={['manage_faculty']}>
                <Suspense fallback={<LoadingSpinner />}>
                  <FacultyPage />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="institutions"
            element={
              <ProtectedRoute requiredRoles={['system_admin', 'super_admin']}>
                <Suspense fallback={<LoadingSpinner />}>
                  <InstitutionsPage />
                </Suspense>
              </ProtectedRoute>
            }
          />

          {/* User Management */}
          <Route
            path="settings"
            element={
              <ProtectedRoute requiredRoles={['admin', 'compliance_officer']}>
                <Suspense fallback={<LoadingSpinner />}>
                  <SettingsPage />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="profile"
            element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingSpinner />}>
                  <ProfilePage />
                </Suspense>
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Error Routes */}
        <Route
          path="/unauthorized"
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-gray-900 mb-4">Unauthorized</h1>
                  <p className="text-gray-600 mb-8">You don't have permission to access this page.</p>
                  <button
                    onClick={() => window.history.back()}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Go Back
                  </button>
                </div>
              </div>
            </Suspense>
          }
        />
        <Route
          path="*"
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <NotFoundPage />
            </Suspense>
          }
        />
      </Routes>
    </AnimatePresence>
  );
};

// Main App Component
const App: React.FC = () => {
  const { theme } = useTheme();

  return (
    <ErrorBoundary>
      <Helmet>
        <title>Viksit Bharat Compliance Suite</title>
        <meta name="description" content="Comprehensive compliance management for educational institutions" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Helmet>
      
      <div className={`app ${theme} min-h-screen bg-gray-50`}>
        <AppRoutes />
      </div>
    </ErrorBoundary>
  );
};

export default App;